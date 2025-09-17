import { Server, Socket } from 'socket.io';
import { Game, Player, Room } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
import { app } from '../app.js';
import { JwtPayload, UserHistory } from '../types/userTypes.js';
import { User, History } from '../models.js';
import { gamesStartedTotal, gamesFinishedTotal, gameDurationHistogram, pongGamesFinishedInfoTotal } from '../monitoring/metrics.js';
import { userService } from '../chat/services/userService.js';
import { CHAT_EVENTS } from '../chat/config/chatConfig.js';

const SCORETOWIN = 3;
let stored: boolean = false;

declare module 'fastify' {
	interface FastifyInstance {
		io: Server;
	}
}

let rooms: Room[] = [];
let roomcount = 0;
const WIN_HEIGHT = 720;
const WIN_WIDTH = 1280;
let gameInterval: NodeJS.Timeout | null = null;
let intervalStarted = false;

function initPlayer(socket: Socket, user: User, room: Room): Player {
	let player: Player = {
		nickName: user.nickName,
		id: socket.id,
		y: WIN_HEIGHT / 2,
		x: 20,
		height: WIN_HEIGHT / 9,
		length: WIN_WIDTH / 90,
		vy: WIN_HEIGHT / 130,
		score: 0,
		key_up: false,
		key_down: false,
		avatar: user.avatar,
		uid: user.id,
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
			vy: 1.5,
			score: 0,
			key_up: false,
			key_down: false,
			avatar: '',
			uid: '',
		},
		p2: {
			nickName: 'p2',
			id: '',
			y: WIN_HEIGHT / 2,
			x: WIN_WIDTH * 0.98,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: 1.5,
			score: 0,
			key_up: false,
			key_down: false,
			avatar: '',
			uid: '',
		},
		ball: {
			x: WIN_WIDTH / 2,
			y: WIN_HEIGHT / 2,
			radius: (WIN_HEIGHT * WIN_WIDTH) / 80000,
			vx: Math.random() < 0.5 ? -6 : 6, //* 0.005),
			vy: Math.random() < 0.5 ? -4 : 4, //* 0.005),* 0.007),
			finalSpeed: 0,
		},
		win: {
			width: WIN_WIDTH,
			height: WIN_HEIGHT,
		},
		over: false,
		started: false,
	};
	return game;
}

export function getRoom(user: User, socket: Socket, arr?: string[]) {
	if (arr && arr.length === 2) {
		const privateRoom = rooms.find(
			room =>
				room.playersNb < 2 &&
				!room.locked &&
				room.private &&
				room.private.length === 2 &&
				arr.every((id, i) => room.private![i] === id) &&
				room.private.includes(user.id)
		);
		if (privateRoom) {
			privateRoom.game.p2 = initPlayer(socket, user, privateRoom);
			privateRoom.game.p2.x = WIN_WIDTH * 0.98;
			socket.join(privateRoom.name);
			privateRoom.locked = true;
			getInputs(socket, privateRoom);
			// console.log('Room found ' + privateRoom.private);
			return;
		}
		if (arr.includes(user.id)) {
			const newRoom = createRoom(arr, user.id);
			newRoom.game.p1 = initPlayer(socket, user, newRoom);
			socket.join(newRoom.name);
			getInputs(socket, newRoom);
			// console.log(newRoom);
			app.io.of('/pong').to(newRoom.name).emit('p1Name', newRoom.game.p1);
			return;
		}
	}
	return rooms.find(room => room.playersNb < 2 && !room.locked && !room.private);
}

export function createRoom(arr: string[], userId: string): Room {
	let newRoom: Room = {
		name: `room_${roomcount++}`,
		playersNb: 0,
		game: initGame(),
		locked: false,
		winner: null,
		nameSet: false,
		private: arr && arr.length === 2 && arr.includes(userId) ? arr : null,
	};
	rooms.push(newRoom);
	return newRoom;
}

async function initPlayerRoom(socket: Socket, cookie: string, arr: string[]) {
	if (cookie) {
		const payload = app.jwt.verify<JwtPayload>(cookie);
		const user = await User.findOneBy({ id: payload.id });
		if (!user) {
			socket.emit('notLogged');
			return;
		}
		// if(user.status === 'in-game') {
		//	socket.emit('notInGame');

		//	return;
		// };
		const room = getRoom(user, socket, arr.length === 2 ? arr : undefined);
		if (arr && arr.length === 2 && arr.includes(user.id)) return;
		if (room && user.id != room.game.p1.uid) {
			room.game.p2 = initPlayer(socket, user, room);
			room.game.p2.x = WIN_WIDTH * 0.98;
			socket.join(room.name);
			room.locked = true;
			getInputs(socket, room);
		} else {
			const newRoom = createRoom(arr, user.id); // modifier par userID
			newRoom.game.p1 = initPlayer(socket, user, newRoom);
			socket.join(newRoom.name);
			getInputs(socket, newRoom);
			app.io.of('/pong').to(newRoom.name).emit('p1Name', newRoom.game.p1);
		}
	} else {
		socket.emit('notLogged');
		return;
	}
}

function handleDisconnect(app: FastifyInstance, socket: Socket) {
	void app;
	socket.on('disconnect', () => {
		const room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
		if (room) {
			room.playersNb--;

			// Update chat presence for both players back to 'online'
			const chatNs = app.io.of('/chat');
			for (const uid of [room.game.p1.uid, room.game.p2.uid]) {
				if (!uid) continue;
				const chatUser = userService.findUserById(uid);
				if (chatUser) {
					userService.updateUserStatus(chatUser.socketId, 'online');
					chatNs.emit(CHAT_EVENTS.USER_STATUS_CHANGED, { userId: chatUser.id, status: 'online' });
				}
			}

			const sock = app.io
				.of('/pong')
				.sockets.get(room.game.p1.id === socket.id ? room.game.p2.id : room.game.p1.id) as Socket;
			if (sock) {
				sock.emit('playerWin', room.game.p1.id === socket.id ? room.game.p2 : room.game.p1, room.game);
				sock.leave(room.name);
				sock.off;
				sock.disconnect();
			}
			// Metrics on disconnect: count as finished only if not already over
			if (!room.game.over) {
				try {
					const result = room.game.p1.id === socket.id ? 'p2_win' : 'p1_win';
					gamesFinishedTotal.inc({ game: 'pong', result });
					const winnerNick = result === 'p1_win' ? room.game.p1.nickName : room.game.p2.nickName;
					pongGamesFinishedInfoTotal.inc({ p1_nick: room.game.p1.nickName, p2_nick: room.game.p2.nickName, winner: winnerNick });
					if (room.game.gameStart) {
						const durationSeconds = (Date.now() - room.game.gameStart) / 1000;
						if (durationSeconds >= 0) {
							gameDurationHistogram.observe({ game: 'pong' }, durationSeconds);
						}
					}
				} catch {}
				room.game.over = true;
			}
			if (socket) {
				socket.leave(room.name);
			}
			if (room.playersNb === 0) rooms = rooms.filter(r => r !== room);
			if (gameInterval) {
				// console.log('aaaaaaaaaa');
				clearInterval(gameInterval);
				stored = false;
			}
		}
		if (socket) {
			socket.off;
			socket.disconnect;
		}
	});
}

export function launchGame(rooms: Room[]) {
	if (!intervalStarted) {
		if (gameInterval){
			clearInterval(gameInterval);
			gameInterval = null;
		} 
		gameInterval = setInterval(() => {
			for (const room of rooms) {
				if (room.playersNb === 2 && room.locked && !room.game!.over) {
					if (!room.game.gameStart) {
						room.game.gameStart = Date.now();
						try { gamesStartedTotal.inc({ game: 'pong' }); } catch {}
					}
					if (!room.game.started) {
						app.io.of('/pong').to(room.name).emit('countdown', room.game);
						setTimeout(() => {
							room.game.started = true;
						}, 3500);
					} else {
						gameLoop(room.game!, app);
						app.io.of('/pong').to(room.name).emit('gameState', room.game);
					}
					if (!room.nameSet) {
						app.io.of('/pong').to(room.name).emit('p1Name', room.game.p1);
						app.io.of('/pong').to(room.name).emit('p2Name', room.game.p2);
						room.nameSet = true;
					}
				} else if (!room.locked && room.playersNb === 1) {
					app.io.of('/pong').to(room.name).emit('waiting', room);
				}
			}
		}, 1000 / 60);
	}
}

export async function startPongGame(app: FastifyInstance) {
	app.ready().then(() => {
		app.io.of('/pong').on('connection', (socket: Socket) => {
			handleDisconnect(app, socket);
			socket.on('initGame', (cookie: string, arr: string[]) => {
				// console.log('New connection to /pong');
				initPlayerRoom(socket, cookie, arr);
				launchGame(rooms);
			});
		});
	});
}

export function getInputs(sock: Socket, room: Room) {
	sock.on('keyup', (key: any, id: string) => {
		//p1
		if (id === room.game.p1.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') {
				room.game.p1.key_up = false;
				app.io.of('/pong').to(room.name).emit('p1UpKeyUp');
			}
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') {
				room.game.p1.key_down = false;
				app.io.of('/pong').to(room.name).emit('p1DownKeyUp');
			}
		}
		//p2
		if (id === room.game.p2.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') {
				room.game.p2.key_up = false;
				app.io.of('/pong').to(room.name).emit('p2UpKeyUp');
			}
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') {
				room.game.p2.key_down = false;
				app.io.of('/pong').to(room.name).emit('p2DownKeyUp');
			}
		}
	});
	sock.on('keydown', (key: any, id: string) => {
		//p1
		if (id === room.game.p1.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') {
				room.game.p1.key_up = true;
				app.io.of('/pong').to(room.name).emit('p1UpKeyDown');
			}
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') {
				room.game.p1.key_down = true;
				app.io.of('/pong').to(room.name).emit('p1DownKeyDown');
			}
		}
		//p2
		if (id === room.game.p2.id) {
			if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp') {
				room.game.p2.key_up = true;
				app.io.of('/pong').to(room.name).emit('p2UpKeyDown');
			}
			if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown') {
				room.game.p2.key_down = true;
				app.io.of('/pong').to(room.name).emit('p2DownKeyDown');
			}
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

async function saveDataInHistory(game: Game, winner: 'P1' | 'P2') {
	stored = true;

	const user1 = await User.findOneBy({ id: game.p1.uid });
	const user2 = await User.findOneBy({ id: game.p2.uid });

	if (!user1 || !user2) {
		// console.log('Users not found');
		return;
	}

	const gametime = game.gameStart ? Date.now() - game.gameStart : 0;

	// Utilisez la méthode qui fonctionne
	const finalBallSpeed = game.ball.finalSpeed / (game.p1.score + game.p2.score);

	const historyp1: UserHistory = {
		type: 'pong',
		date: new Date().toISOString(),
		win: winner === 'P1' ? 'WIN' : 'LOOSE',
		opponent: user2.id,
		score: `${game.p1.score}:${game.p2.score}`,
		finalLength: 0,
		finalBallSpeed: finalBallSpeed,
		gameTime: gametime,
	};

	const historyp2: UserHistory = {
		type: 'pong',
		date: new Date().toISOString(),
		win: winner === 'P2' ? 'WIN' : 'LOOSE',
		opponent: user1.id,
		score: `${game.p2.score}:${game.p1.score}`,
		finalLength: 0,
		finalBallSpeed: finalBallSpeed,
		gameTime: gametime,
	};

	const historyEntry1 = new History(user1, historyp1);
	const historyEntry2 = new History(user2, historyp2);

	await historyEntry1.save();
	await historyEntry2.save();

	// console.log('History saved for both players');
}

function checkWin(game: Game, app: FastifyInstance) {
	if (game.p1.score === SCORETOWIN || game.p2.score === SCORETOWIN) {
		let save = game;
		if (!stored) game.p1.score === SCORETOWIN ? saveDataInHistory(save, 'P1') : saveDataInHistory(save, 'P2');
		const room = rooms.find(r => r.game.p1.id === game.p1.id || r.game.p2.id === game.p2.id);
		if (room) {
			if (!room.winner) room.winner = room.game.p1.score > room.game.p2.score ? room.game.p1 : room.game.p2;
			app.io.of('/pong').to(room.name).emit('playerWin', room.winner, game);
		}
		// Metrics: record game finished and duration exactly once
		try {
			const result = game.p1.score === SCORETOWIN ? 'p1_win' : 'p2_win';
			gamesFinishedTotal.inc({ game: 'pong', result });
			// Also record detailed info with player nicknames
			const winnerNick = result === 'p1_win' ? game.p1.nickName : game.p2.nickName;
			pongGamesFinishedInfoTotal.inc({ p1_nick: game.p1.nickName, p2_nick: game.p2.nickName, winner: winnerNick });
			if (game.gameStart) {
				const durationSeconds = (Date.now() - game.gameStart) / 1000;
				if (durationSeconds >= 0) {
					gameDurationHistogram.observe({ game: 'pong' }, durationSeconds);
				}
			}
		} catch {}
		// Mark game as over to stop loop and avoid duplicate emits
		game.over = true;
		game.ball.vx = 0;
		game.ball.vy = 0;
		game.ball.x = WIN_WIDTH / 2;
		game.ball.y = WIN_HEIGHT / 2;
		return true;
	}
	return false;
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
		game.ball.vy += impactPoint * 2;

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
	movePlayer(game);
	if (checkWin(game, app)) return;

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
		game.ball.finalSpeed += (Math.abs(game.ball.vx) + Math.abs(game.ball.vy)) / 2;
		resetBall(game);
	}
	if (game.ball.x > WIN_WIDTH) {
		game.p1.score += 1;
		game.ball.finalSpeed += (Math.abs(game.ball.vx) + Math.abs(game.ball.vy)) / 2;
		resetBall(game);
	}
}

function resetBall(game: Game) {
	game.p1.y = WIN_HEIGHT / 2;
	game.p2.y = WIN_HEIGHT / 2;
	game.ball.x = WIN_WIDTH / 2;
	game.ball.y = WIN_HEIGHT / 2;
	game.ball.vx = Math.random() < 0.5 ? -6 : 6; //380);
	game.ball.vy = Math.random() < 0.5 ? -4 : 4; //280);
}
