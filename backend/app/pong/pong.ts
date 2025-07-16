import { Server, Socket } from 'socket.io';
import { Game } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
import { gameLoop } from '../../../frontend/src/pong';

declare module 'fastify' {
	interface FastifyInstance {
		io: Server;
	}
}

const WIN_HEIGHT = 720;
const WIN_WIDTH = 1280;

let game: Game;

function initGame(): Game {
	game = {
		win: {
			w: WIN_WIDTH,
			h: WIN_HEIGHT,
		},
		p1: {
			name: 'player 1',
			y: WIN_HEIGHT / 2,
			x: 20,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 150,
			score: 0,
		},
		p2: {
			name: 'player 2',
			y: WIN_HEIGHT / 2,
			x: WIN_WIDTH * 0.98,
			height: WIN_HEIGHT / 9,
			length: WIN_WIDTH / 90,
			vy: WIN_HEIGHT / 150,
			score: 0,
		},
		ball: {
			x: WIN_WIDTH / 2,
			y: WIN_HEIGHT / 2,
			radius: (WIN_HEIGHT * WIN_WIDTH) / 80000,
			vx: 0,
			vy: 0,
		},
		key: {
			w: false,
			s: false,
			up: false,
			down: false,
		},
	};
	return game;
}

export async function startPongGame(app: FastifyInstance) {
	app.ready().then(() => {
		console.log('LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
		try {
			app.io.on('connection', (socket: Socket) => {
				// console.log('ICIIIIIIIIIIIIIIIIIIIIIIIII');
				socket.on('initGame', () => {
					// initGame();
					// console.log(initGame())
					socket.emit('gameState', initGame());
					setInterval(() => {
						gameLoop(socket);
					}, 1000/ 60 );
				});
				socket.on('playerAction', ({ gameId, action }) => {
					console.log(gameId);
					console.log(action);
				});
			});
		} catch (err) {
			console.log(err);
		}
	});
}

function movePlayer(socket: Socket) {
	if (game.key.w === true && game.p1.y - game.p1.vy >= -10) game.p1.y -= game.p1.vy;
	if (game.key.s === true && game.p1.y + game.p1.vy <= WIN_HEIGHT - game.p1.height) game.p1.y += game.p1.vy;
	if (game.key.up === true && game.p2.y - game.p2.vy >= -10) game.p2.y -= game.p2.vy;
	if (game.key.down === true && game.p2.y + game.p2.vy <= WIN_HEIGHT - game.p2.height) game.p2.y += game.p2.vy;
}

function checkWin(socket: Socket) {
	if (game.p1.score === 1 || game.p2.score === 1) {
		game.ball.vx = 0;
		game.ball.vy = 0;
		game.ball.x = WIN_WIDTH / 2;
		game.ball.y = WIN_HEIGHT / 2;
		if (game.p1.score === 1) {
			//emit('p1wins');
			// ctx!.fillText(game.p1.name + ' wins', WIN_WIDTH * 0.5, WIN_HEIGHT * 0.33);
		}
		if (game.p2.score === 1) {
			//emit('p2wins');
			// ctx!.fillText(game.p2.name + ' wins', WIN_WIDTH * 0.5, WIN_HEIGHT * 0.33);
		}
		return;
	}
}

function handlePaddleCollisionP1(socket: Socket) {
	const collision =
		game.ball.x > game.p1.x &&
		game.ball.x < game.p1.x + game.p1.length &&
		game.ball.y + game.ball.radius > game.p1.y &&
		game.ball.y - game.ball.radius < game.p1.y + game.p1.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;

		const impactPoint = (game.ball.y - (game.p1.y + game.p1.height / 2)) / (game.p1.height / 2);
		game.ball.vy += impactPoint * 3;
		console.log(game.ball.vy);

		if (Math.abs(game.ball.vx) < 40) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

function handlePaddleCollisionP2(socket: Socket) {
	const collision =
		game.ball.x + game.ball.radius > game.p2.x &&
		game.ball.x - game.ball.radius < game.p2.x + game.p2.length &&
		game.ball.y + game.ball.radius > game.p2.y &&
		game.ball.y - game.ball.radius < game.p2.y + game.p2.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;

		const impactPoint = (game.ball.y - (game.p2.y + game.p2.height / 2)) / (game.p2.height / 2);
		game.ball.vy += impactPoint * 3;
		console.log(game.ball.vy);

		if (Math.abs(game.ball.vx) < 40) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

function gameLoop(socket: Socket) {
	movePlayer(socket);
	checkWin(socket);
	// ball movement
	game.ball.x += game.ball.vx;
	game.ball.y += game.ball.vy;

	// collision celling
	if (game.ball.y <= 0 || game.ball.y >= WIN_HEIGHT - game.ball.radius) {
		game.ball.vy = -game.ball.vy;
	}
	handlePaddleCollisionP1(socket);
	handlePaddleCollisionP2(socket);
	if (game.ball.x < 0) {
		game.p2.score += 1;
		game.ball.x = WIN_WIDTH / 2;
		game.ball.y = WIN_HEIGHT / 2;
		game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280);
		game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180);
	}
	if (game.ball.x > WIN_WIDTH) {
		game.p1.score += 1;
		game.ball.x = WIN_WIDTH / 2;
		game.ball.y = WIN_HEIGHT / 2;
		game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280);
		game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180);
	}
}
