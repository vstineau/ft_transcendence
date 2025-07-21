import io, { Socket } from 'socket.io-client';
import { Game } from '../types/pongTypes';
// import { async } from '../../backend/app/pong/pong';

// let canvas: HTMLCanvasElement;
// let ctx: CanvasRenderingContext2D | null;

// let win_width = window.innerWidth;
// let win_height = window.innerHeight;

export function createPongSocket(): Socket {
	const socket = io('https://localhost:8080');

	socket.on('connect', () => {
		console.log('Socket connected!');
		socket.emit('initGame');
	});

	// socket.emit('joinGame', 'game1');

	// socket.on('gameState', gameState => {

	// 	stats = gameState;
	// 	console.log(stats);
	// });
	return socket;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;

function initCanvas() {
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	if (!canvas) {
		console.error("❌ Canvas 'gameCanvas' not found");
		return;
	}
	canvas.width = win_width;
	canvas.height = win_height;
	ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('❌ Failed to get canvas context');
	}
}


function drawGame(stats: Game, socket: Socket) {
	if (!ctx) return;
	let scale_x = canvas.width / stats.win.width;
	let scale_y = canvas.height / stats.win.height;

	ctx.clearRect(0, 0, stats.win.width * scale_x, stats.win.height * scale_y);

	// Background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, stats.win.width * scale_x, stats.win.height * scale_y);

	// Ball
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.fillRect(stats.ball.x * scale_x, stats.ball.y * scale_y, stats.ball.radius * scale_x, stats.ball.radius * scale_y);
	ctx.closePath();

	// Paddles
	ctx.fillRect(stats.p1.x * scale_x, stats.p1.y * scale_y, stats.p1.length * scale_x, stats.p1.height * scale_y);
	ctx.fillRect(stats.p2.x * scale_x, stats.p2.y * scale_y, stats.p2.length * scale_x, stats.p2.height * scale_y);

	// Net (dashed center line)
	for (let i = 0; i < stats.win.height * scale_y; i += 25) {
		ctx.fillRect((stats.win.width * scale_x) / 2 - 2, i * scale_y, 4 * scale_x, 15 * scale_y);
	}

	// Scores
	ctx.font = '50px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(stats.p1.score.toString(), stats.win.width * scale_x * 0.25, 60);
	ctx.fillText(stats.p2.score.toString(), stats.win.width * scale_x * 0.75, 60);
	
	socket.on('playerWin', (winner) => {
		//winner announcement
		if(ctx){
			ctx.fillStyle = 'white';
			ctx.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
			ctx.fillStyle = 'black';
			ctx.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(winner.name + ' wins', stats.win.width * scale_x * 0.5, stats.win.height * scale_y * 0.33);
		}
	})
}

export function pongGame() {
	const socket = createPongSocket();
	initCanvas();

	// Key controls
	window.addEventListener('beforeunload', () => {
		socket.emit('beforeunload');
	});
	window.addEventListener('keydown', e => {
		socket.emit('keydown', { key: e.key });
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
			e.preventDefault();
		}
	});

	window.addEventListener('keyup', e => {
		socket.emit('keyup', { key: e.key });
	});

	// Resize handling
	window.addEventListener('resize', () => {
		win_width = window.innerWidth;
		win_height = window.innerHeight;
		if (canvas) {
			canvas.width = win_width;
			canvas.height = win_height;
		}
		socket.emit('resize');
	});

	// Main game loop (frame update)
	socket.on('gameState', (stats: Game) => {
		drawGame(stats, socket);
	});
}
