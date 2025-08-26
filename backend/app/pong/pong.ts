import { Server, Socket } from 'socket.io';
// import { EventEmitter } from 'events';
import { Game, Player, Room } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
import { app } from '../app.js';
import { JwtPayload } from '../types/userTypes.js';
import { User } from '../models.js';
// import { Player } from '../types/pongTypes';

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

export function initPlayer(socket: Socket, user: User, room: Room): Player {
	let player: Player = {
		nickName: user.nickName,
		id: socket.id,
		y: WIN_HEIGHT / 2,
		x: room.playersNb === 0 ? 20 : WIN_WIDTH * 0.98,
		height: WIN_HEIGHT / 9,
		length: WIN_WIDTH / 90,
		vy: WIN_HEIGHT / 130,
		score: 0,
		key_up: false,
		key_down: false,
		avatar: user.avatar,
		login: user.login,
	};
	room.playersNb += 1;
	return player;
}

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
		winner: null,
	};
	getInputs(socket, newRoom.game);
	newRoom.game.p1.id = socket.id;
	rooms.push(newRoom);
	return newRoom;
}

async function initPlayerRoom(socket: Socket, cookie: string) {
	if (cookie) {
		const payload = app.jwt.verify<JwtPayload>(cookie);
		const user = await User.findOneBy({ login: payload.login });
		if (!user) {
			socket.emit('notLogged');
			return;
		}
		const room = getRoom();
		if (room && user.login != room.game.p1.login) {
			room.game.p2 = initPlayer(socket, user, room);
			socket.join(room.name);
			room.locked = true;
			getInputs(socket, room.game);
		} else {
			const newRoom = createRoom(socket);
			newRoom.game.p1 = initPlayer(socket, user, newRoom);
			socket.join(newRoom.name);
		}
	} else {
		socket.emit('notLogged');
		return;
	}
}

function handleDisconnect(app: FastifyInstance, socket: Socket) {
	void app;
	socket.on('disconnect', () => {
		// Trouver la room du joueur
		const room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
		if (room) {
			room.playersNb--;
			const sock = app.io.sockets.sockets.get(room.game.p1.id === socket.id ? room.game.p2.id : room.game.p1.id) as Socket;
			sock.emit('playerWin', room.game.p1.id === socket.id ? room.game.p2.nickName : room.game.p1.nickName, room.game);
			socket.leave(room.name);
			sock.leave(room.name);
			rooms = rooms.filter(r => r !== room);
		}
		socket.off;
		socket.disconnect;
	});
}

export function launchGame(rooms: Room[]) {
	if (!intervalStarted) {
		intervalStarted = true;
		setInterval(() => {
			// Pour chaque room prête, broadcast son état de jeu à tous ses joueurs
			for (const room of rooms) {
				if (room.playersNb === 2 && room.locked && !room.game!.over) {
					gameLoop(room.game!, app);
					app.io.to(room.name).emit('gameState', room.game);
				} else if (!room.locked && room.playersNb === 1) {
					app.io.to(room.name).emit('waiting', room);
				}
			}
		}, 1000 / 60);
	}
}

export function startPongGame(app: FastifyInstance) {
	app.ready().then(() => {
		app.io.on('connection', (socket: Socket) => {
			handleDisconnect(app, socket);
			socket.on('initGame', (cookie: string) => {
				initPlayerRoom(socket, cookie);
				launchGame(rooms);
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
			if (!room.winner) room.winner = room.game.p1.score > room.game.p2.score ? room.game.p1 : room.game.p2;
			app.io.to(room.name).emit('playerWin', room.winner, game);
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
