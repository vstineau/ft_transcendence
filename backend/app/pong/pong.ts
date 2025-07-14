//SIZE 1000 X 1000
//import { app } from '../app.js'
import { Server, Socket } from 'socket.io';
import { Game } from '../types/pongTypes.js';
//import  fastifySocketIO from 'fastify-socket.io'
import { FastifyInstance } from 'fastify';
// import { Game, Key } from '../types/pongTypes';
// import { GameState } from 'type';

declare module 'fastify' {
	interface FastifyInstance {
		io: Server;
	}
}

let gameState: Game;

function initGame(height: number, width: number) {
	gameState = {
    win: {
      w: width,
      h: height,
    },
		p1: {
			name: 'player 1',
			y: height / 2,
			x: 20,
			height: height / 9,
			length: width / 90,
			vy: height / 150,
			score: 0,
		},
		p2: {
			name: 'player 2',
			y: height / 2,
			x: width * 0.98,
			height: height / 9,
			length: width / 90,
			vy: height / 150,
			score: 0,
		},
		ball: {
			x: width / 2,
			y: height / 2,
			radius: (height * width) / 80000,
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
}

export async function startPongGame(app: FastifyInstance) {
	app.ready().then(() => {
		console.log('LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
		try {
			app.io.on('connection', (socket: Socket) => {
				console.log('ICIIIIIIIIIIIIIIIIIIIIIIIII');
				socket.on('initGame', (height: number, width: number) => {
          initGame(height, width);
					socket.emit('gamestate', gameState);
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
