import { Server, Socket } from 'socket.io';
// import { EventEmitter } from 'events';
import { Game } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
import { app } from '../app.js';
import { JwtPayload } from '../types/userTypes.js';
import { User } from '../models.js';

// EventEmitter.defaultMaxListeners = 30;
declare module 'fastify' {
	interface FastifyInstance {
		io: Server;
	}
}

const WIN_HEIGHT = 720;
const WIN_WIDTH = 1280;

// let game: Game;
let intervalStarted = false;

function initGame(): Game {
	let game = {
		p1: {
			nickName: 'p1',
			id: '',
			y: WIN_HEIGHT / 2,
			x: 20,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 130,
			score: 0,
			key_up: false,
			key_down: false,
			avatar: '',
			login: '',
		},
		p2: {
			nickName: 'p2',
			id: '',
			y: WIN_HEIGHT / 2,
			x: WIN_WIDTH * 0.98,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 130,
			score: 0,
			key_up: false,
			key_down: false,
			avatar: '',
			login: '',
		},
		ball: {
			x: WIN_WIDTH / 2,
			y: WIN_HEIGHT / 2,
			radius: (WIN_HEIGHT * WIN_WIDTH) / 80000,
			vx: (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280),
			vy: (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180),
		},
		win: {
			width: WIN_WIDTH,
			height: WIN_HEIGHT,
		},
		over: false,
	};
	return game;
}
type Room = {
	name: string;
	playersNb: number;
	game: Game;
	locked: boolean;
};

let rooms: Room[] = [];
let roomcount = 0;

function getRoom() {
	return rooms.find(room => room.playersNb < 2 && !room.locked);
}

function createRoom(socket: Socket): Room {
	let newRoom: Room = {
		name: `room_${roomcount++}`,
		playersNb: 1, ////// changer ca
		game: initGame(),
		locked: false,
	};
	getInputs(socket, newRoom.game);
	newRoom.game.p1.id = socket.id;
	rooms.push(newRoom);
	return newRoom;
}

async function initRoom(socket: Socket, cookie: string) {
	// console.log('cookie = ' + cookie);
	let nickName: string;
	let user;
	if (cookie) {
		const payload = app.jwt.verify<JwtPayload>(cookie);
		user = await User.findOneBy({ login: payload.login });
		if (!user) {
			socket.emit('notLogged');
			return;
		}
		// console.log(user);
		nickName = user.nickName;
	} else {
		socket.emit('notLogged');
		return;
	}
	console.log(`user = ${user.login}`);
	console.log(`nickname = ${user.nickName}`);
	const room = getRoom();
	if (room && user.login != room.game.p1.login) {
		socket.join(room.name);
		socket.emit('roomjoined', room.name);
		room.playersNb = 2;
		room.game.p2.id = socket.id;
		room.game.p2.nickName = nickName;
		room.game.p2.login = user.login;
		room.locked = true;
		getInputs(socket, room.game);
	} else {
		const newRoom = createRoom(socket);
		newRoom.game.p1.login = user.login;
		newRoom.game.p1.nickName = user.nickName;
		socket.join(newRoom.name);
	}
	console.log(`roomcount = ${roomcount}`);
}

function handleDisconnect(app: FastifyInstance, socket: Socket) {
	void app;
	socket.on('disconnect', () => {
		// Trouver la room du joueur
		const room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
		if (room) {
			room.playersNb--;
			// if (room.game.p1.id === socket.id) {
			// 	room.game.p1.id = '';
			// } else if (room.game.p2.id === socket.id) {
			// 	room.game.p2.id = '';
			// }
			// le ternaire c'est la vie
			// room.game.p1.id === socket.id ? (room.game.p1.id = '') : (room.game.p2.id = '');
			// if(!room.game.over){
				const sock = app.io.of('/pong').sockets.get(room.game.p1.id === socket.id ? room.game.p2.id : room.game.p1.id) as Socket
			if (sock) {
				sock.emit('playerWin', room.game.p1.id === socket.id ? room.game.p2.nickName : room.game.p1.nickName, room.game);
				sock.leave(room.name);

			}
			if (socket) {

				socket.leave(room.name);
			}
			// app.io
			// 	.to(room.name)
			//console.log('data sock : ', sock);
			//console.log('data socket : ', socket);
			// }
			// room.game.over = true;
			rooms = rooms.filter(r => r !== room);
			// roomcount--;
		}
		if (socket) {
			socket.off;
			socket.disconnect;
		}
	});
}

export async function startPongGame(app: FastifyInstance) {
	app.ready().then(() => {
		app.io.of('/pong').on('connection', (socket: Socket) => {
			socket.on('initGame', (cookie: string) => {
				initRoom(socket, cookie);
				handleDisconnect(app, socket);
				if (!intervalStarted) {
					intervalStarted = true;
					setInterval(() => {
						// Pour chaque room prête, broadcast son état de jeu à tous ses joueurs
						for (const room of rooms) {
							if (room.playersNb === 2 && room.locked) {
								gameLoop(room.game, app);
								app.io.of('/pong').to(room.name).emit('gameState', room.game);
							} else if (!room.locked && room.playersNb === 1) {
								app.io.of('/pong').to(room.name).emit('waiting', room);
							}
						}
					}, 1000 / 60);
				}
			});
		});
	});
}

function getInputs(sock: Socket, game: Game) {
	sock.on('keyup', (key: any, id: string) => {
		//p1
		if (id === game.p1.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p1.key_up = false;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p1.key_down = false;
		}
		//p2
		if (id === game.p2.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p2.key_up = false;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p2.key_down = false;
		}
	});
	sock.on('keydown', (key: any, id: string) => {
		//p1
		if (id === game.p1.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p1.key_up = true;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p1.key_down = true;
		}
		//p2
		if (id === game.p2.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p2.key_up = true;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p2.key_down = true;
		}
	});
}

function movePlayer(game: Game) {
	if (game.p1.key_up === true && game.p1.y - game.p1.vy >= 5) {
		game.p1.y -= game.p1.vy;
	}
	if (game.p1.key_down === true && game.p1.y + game.p1.vy <= WIN_HEIGHT - game.p1.height) {
		game.p1.y += game.p1.vy;
	}
	if (game.p2.key_up === true && game.p2.y - game.p2.vy >= 5) {
		game.p2.y -= game.p2.vy;
	}
	if (game.p2.key_down === true && game.p2.y + game.p2.vy <= WIN_HEIGHT - game.p2.height) {
		game.p2.y += game.p2.vy;
	}
}

function checkWin(game: Game, app: FastifyInstance) {
	if (game.p1.score === 1 || game.p2.score === 1) {
		game.ball.vx = 0;
		game.ball.vy = 0;
		game.ball.x = WIN_WIDTH / 2;
		game.ball.y = WIN_HEIGHT / 2;
		const room = rooms.find(r => r.game.p1.id === game.p1.id || r.game.p2.id === game.p2.id);
		if (room) {
			app.io.of('/pong').to(room.name).emit('playerWin', game.p1.score > game.p2.score ? game.p1.nickName : game.p2.nickName, game);
		}
	}
}

function handlePaddleCollisionP1(game: Game) {
	const collision =
		game.ball.x > game.p1.x &&
		game.ball.x < game.p1.x + game.p1.length &&
		game.ball.y + game.ball.radius > game.p1.y &&
		game.ball.y - game.ball.radius < game.p1.y + game.p1.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;

		const impactPoint = (game.ball.y - (game.p1.y + game.p1.height / 2)) / (game.p1.height / 2);
		game.ball.vy += impactPoint * 3;

		if (Math.abs(game.ball.vx) < 40) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

function handlePaddleCollisionP2(game: Game) {
	const collision =
		game.ball.x + game.ball.radius > game.p2.x &&
		game.ball.x - game.ball.radius < game.p2.x + game.p2.length &&
		game.ball.y + game.ball.radius > game.p2.y &&
		game.ball.y - game.ball.radius < game.p2.y + game.p2.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;

		const impactPoint = (game.ball.y - (game.p2.y + game.p2.height / 2)) / (game.p2.height / 2);
		game.ball.vy += impactPoint * 3;

		if (Math.abs(game.ball.vx) < 40) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

function gameLoop(game: Game, app: FastifyInstance) {
	// console.log('game is gaming');
	// getInputs(socket, game);
	// Pour chaque room prête, broadcast son état de jeu à tous ses joueurs
	movePlayer(game);
	checkWin(game, app);

	// Move ball
	game.ball.x += game.ball.vx;
	game.ball.y += game.ball.vy;

	// Bounce on top/bottom
	if (game.ball.y <= 0 || game.ball.y >= WIN_HEIGHT - game.ball.radius) {
		game.ball.vy = -game.ball.vy;
	}

	// Collisions
	handlePaddleCollisionP1(game);
	handlePaddleCollisionP2(game);

	// Score check
	if (game.ball.x < 0) {
		game.p2.score += 1;
		resetBall(game);
	}
	if (game.ball.x > WIN_WIDTH) {
		game.p1.score += 1;
		resetBall(game);
	}
}

// function resetGame(game: Game) {
// 	resetBall(game);
// 	game.p1.score = 0;
// 	game.p2.score = 0;
// }

function resetBall(game: Game) {
	// game.p1.score = 0;
	// game.p2.score = 0;
	game.p1.y = WIN_HEIGHT / 2;
	game.p2.y = WIN_HEIGHT / 2;
	game.ball.x = WIN_WIDTH / 2;
	game.ball.y = WIN_HEIGHT / 2;
	game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280);
	game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180);
}
