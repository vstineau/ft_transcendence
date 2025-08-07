import io, { Socket } from 'socket.io-client';
import { Game, Food } from '../types/snakeTypes';


let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameOver = false;


export function createSnakeSocket(): Socket {
    const socket = io('https://localhost:8080');
	socket.on('connect', () => {
		console.log('Socket connected!');
		socket.emit('initGame_snake');
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

function drawWaitingScreen(game: Game) {
    if (!ctx) return;

    // On utilise les mêmes scales que dans drawGame
    const scale = canvas.width / game.winSize;

    ctx.clearRect(0, 0, game.winSize * scale, game.winSize * scale);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, game.winSize * scale, game.winSize * scale);

    ctx.font = `${40 * scale}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Waiting for player ... (1 / 2)', (game.winSize * scale) / 2, (game.winSize * scale) / 2);
}

function drawGame(game: Game) {
	if (!ctx || gameOver)
		return ;
	let scale = canvas.height / game.winSize;

	// snake and food size
	const size = Math.floor(Math.min(canvas.width, canvas.height) / game.winSize) * 20;
	//console.log(game);

	ctx.fillStyle = "black";
 	ctx.fillRect(0, 0, game.winSize * scale, game.winSize * scale);

 	 // Draw foods
 	 for (const food of game.foods) {
 	   ctx.fillStyle = food.side === 'left' ? "#0ff" : "#f0f";
 	   ctx.fillRect(food.pos.x * scale, food.pos.y * scale, size, size);
 	 }

 	 // Draw snakes
 	 [game.p1, game.p2].forEach(snake => {
		if (!ctx)
			return ;
 	   ctx.fillStyle = snake.color;
 	   for (const seg of snake.segments) {
 	     ctx.fillRect(seg.x * scale, seg.y * scale, size, size);
 	   }
 	 });
}

function listenUserInputs(socket: Socket) {
	// Key controls
	window.addEventListener('beforeunload_snake', (e) => {
		socket.emit('beforeunload_snake');
		e.preventDefault();
		gameOver = false;
	});
	window.addEventListener('keydown', e => {
		socket.emit('keydown_snake', { key: e.key }, socket.id);
		if (e.key === 'ArrowUp' ||
			e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight') {
			e.preventDefault();
		}
	});
	// Resize handling
	window.addEventListener('resize', () => {
		win_width = window.innerWidth;
		win_height = window.innerHeight;
		if (canvas) {
			canvas.width = win_width;
			canvas.height = win_height;
		}
	});
}


export function snakeGame() {
	const socket = createSnakeSocket();
	initCanvas();
	listenUserInputs(socket);
	socket.on('waiting_snake', (game: Game) => {
		drawWaitingScreen(game);
	})
	socket.on('playerWin_snake', (winner, game) => {
		if (ctx) {
		gameOver = true;
		let scale = canvas.width / game.winSize;
		//winner announcement
			ctx.fillStyle = 'white';
			ctx.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
			ctx.fillStyle = 'black';
			ctx.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(winner.name + ' wins', game.winSize * scale * 0.5, game.winSize * scale * 0.33);
			return ;
		}
	});
	// Main game loop (frame update)
	socket.on('gameState_snake', (game: Game) => {
		drawGame(game);
	});

}
