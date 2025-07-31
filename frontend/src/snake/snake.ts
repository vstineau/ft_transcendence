import io, { Socket } from 'socket.io-client';
import { Game } from '../types/snakeTypes';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameOver = false;


export function createSnakeSocket(): Socket {
	const socket = io('https://localhost:8080');

	socket.on('connect', () => {
		console.log('Socket connected!');
		socket.emit('initGame');
	});
	return socket;
}


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


function drawGame(game: Game, socket: Socket) {
	if (!ctx || gameOver)
		return ;
	let scale = canvas.width / game.winSize;

	const size = 20; // snake and food size

	ctx.fillStyle = "black";
 	ctx.fillRect(0, 0, game.winSize * scale, game.winSize * scale);

 	 // Draw foods
 	 for (const food of game.foods) {
 	   ctx.fillStyle = food.side === 'left' ? "#0ff" : "#f00";
 	   ctx.fillRect(food.pos.x * size, food.pos.y * size, size, size);
 	 }

 	 // Draw snakes
 	 [game.p1, game.p2].forEach(snake => {
		if (!ctx)
			return ;
 	   ctx.fillStyle = snake.color;
 	   for (const seg of snake.segments) {
 	     ctx.fillRect(seg.x * size, seg.y * size, size, size);
 	   }
 	 });
}



function listenUserInputs(socket: Socket) {
	// Key controls
	window.addEventListener('beforeunload', (e) => {
		socket.emit('beforeunload');
		// e.preventDefault();
		gameOver = false;
	});
	window.addEventListener('keypress', e => {
		socket.emit('keypress', { key: e.key });
		if (e.key === ' ') {
			e.preventDefault();
			gameOver = false;
		}
	});
	window.addEventListener('keydown', e => {
		socket.emit('keydown', { key: e.key });
		if (e.key === 'ArrowUp' ||
			e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight') {
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
}


export function snakeGame() {
	const socket = createSnakeSocket();
	initCanvas();

	listenUserInputs(socket);

}
