import { Server, Socket } from 'socket.io';
// import { EventEmitter } from 'events';
import { Game } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
// import { app } from '../app.js';
// import { JwtPayload } from '../types/userTypes.js';
// import { User } from '../models.js';
// import { IUserReply } from '../types/userTypes.js';
// import { User } from '../models.js';
// import { app } from '../app';
// import io from 'socket.io-client';
// import fastifyCookie from '@fastify/cookie';

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
			name: 'p1',
			id: '',
			y: WIN_HEIGHT / 2,
			x: 20,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 130,
			score: 0,
			key_up: false,
			key_down: false,
		},
		p2: {
			name: 'p2',
			id: '',
			y: WIN_HEIGHT / 2,
			x: WIN_WIDTH * 0.98,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 130,
			score: 0,
			key_up: false,
			key_down: false,
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
		playersNb: 1,
		game: initGame(),
		locked: false,
	};
	getInputs(socket, newRoom.game);
	newRoom.game.p1.id = socket.id;
	rooms.push(newRoom);
	return newRoom;
}

async function initRoom(socket: Socket) {
	console.log('fffffffffffffffffffffffffffffffffffffffffffffffffffff');
	// if (cookie) {
	// 	const payload = app.jwt.verify<JwtPayload>(cookie);
	// 	const user = await User.findOneBy({ login: payload.login });
	// 	console.log(user);
	// }
	const room = getRoom();
	if (room) {
		socket.join(room.name);
		socket.emit('roomjoined', room.name);
		room.playersNb = 2;
		room.game.p2.id = socket.id;
		room.locked = true;
		getInputs(socket, room.game);
	} else {
		const newRoom = createRoom(socket);
		socket.join(newRoom.name);
	}
}

function handleDisconnect(app: FastifyInstance, socket: Socket) {
	void app;
	socket.on('disconnect', () => {
		// Trouver la room où était ce joueur
		// console.log(`client ${socket.id} disconnected`);
		const room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
		if (room) {
			room.game.over = true;
			room.playersNb--;
			// console.log(`connected players = ${room.playersNb}`);
			if (room.game.p1.id === socket.id) {
				room.game.p1.id = ''; // ou null
			} else if (room.game.p2.id === socket.id) {
				room.game.p2.id = '';
			}
			// si la room est vide
			if (room.playersNb === 0) {
				// console.log(`room ${room.name} closed`);
				rooms = rooms.filter(r => r !== room);
				roomcount--;
			}
			app.io
				.to(room.name)
				.emit('playerWin', room.game.p1.id > room.game.p2.id ? room.game.p1.id : room.game.p2.id, room.game);
			// } else if (room.playersNb === 1) {
			// 	// Si un joueur reste
			// 	app.io.to(room.name).emit('Waiting', room.game);
			// }
		}
		socket.off;
		socket.disconnect;
	});
}

// async function getUserInfos(socket: Socket) { // verifier que l'user est log si non le rediiger sur /login
// 	try {
// 		const response = await fetch(`https://localhost:8080/api/game/matchmaking`, {
// 			method: 'GET',
// 			headers: {},
// 			credentials: 'include',
// 		});
// 		const data = (await response.json()) as IUserReply[200]; // changer pour as any
// 		if (data.success) {
// 			let room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id)
// 			if(room && data.user?.nickName){
// 				room.game.p1.name = data.user?.nickName
// 			}
// 			socket.emit("")
// 		// } else {
// 		// 	displayError(data.error || 'Erreur inconnue');
// 		}
// 	} catch (err) {
// 		console.error('error = ', err);
// 	}
// }

export async function startPongGame(app: FastifyInstance) {
	// let game = initGame();

	app.ready().then(() => {
		// console.log('Pong backend is ready');

		app.io.on('connection', (socket: Socket) => {
			// console.log('Client connected:', socket.id);
			// console.log('number of room = ' + roomcount);
			socket.on('initGame', () => {
				initRoom(socket);
				handleDisconnect(app, socket);
				if (!intervalStarted) {
					intervalStarted = true;
					setInterval(() => {
						// Pour chaque room prête, broadcast son état de jeu à tous ses joueurs
						for (const room of rooms) {
							if (room.playersNb === 2 && room.locked) {
								gameLoop(room.game, app);
								app.io.to(room.name).emit('gameState', room.game);
							} else if (!room.locked && room.playersNb > 0 && room.playersNb < 2) {
								// console.log(`room is ${room.locked}`)
								app.io.to(room.name).emit('waiting', room);
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
		// console.log(sock.id);
		// console.log(`p1 = ${game.p1.id}`);
		// console.log(`p2 = ${game.p2.id}`);
		//p1
		if (id === game.p1.id) {
			// console.log(`KEYDOWN -> sock.id = ${sock.id}, p1.id = ${game.p1.id}, key = ${key.key}`);
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p1.key_up = false;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p1.key_down = false;
		}
		//p2
		if (id === game.p2.id) {
			// console.log(`KEYDOWN -> sock.id = ${sock.id}, p2.id = ${game.p2.id}, key = ${key.key}`);
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p2.key_up = false;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p2.key_down = false;
		}
	});
	sock.on('keydown', (key: any, id: string) => {
		// console.log(sock.id);
		// console.log(`p1 = ${game.p1.id}`);
		// console.log(`p2 = ${game.p2.id}`);
		//p1
		if (id === game.p1.id) {
			// console.log(`KEYUP -> id = ${id}, p1.id = ${game.p1.id}, key = ${key.key}`);
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p1.key_up = true;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p1.key_down = true;
		}
		//p2
		if (id === game.p2.id) {
			// console.log(`KEYUP -> id = ${id}, p2.id = ${game.p2.id}, key = ${key.key}`);
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') game.p2.key_up = true;
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') game.p2.key_down = true;
		}
	});

	// provisoire
	sock.on('keypress', (key: any) => {
		// console.log(key.key);
		if (key.key === ' ') {
			resetGame(game);
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
		// const targetSocket = app.io.sockets.sockets.get(socketId);
		if (room) {
			// console.log(`${room.name} finished`);
			app.io.to(room.name).emit('playerWin', game.p1.score > game.p2.score ? game.p1.id : game.p2.id, game);
			// console.log(`room ${room.name} closed`);
			// rooms = rooms.filter(r => r !== room);
			roomcount--;
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

function resetGame(game: Game) {
	resetBall(game);
	game.p1.score = 0;
	game.p2.score = 0;
}

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
