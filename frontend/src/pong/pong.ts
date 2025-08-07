import io, { Socket } from 'socket.io-client';
import { Game } from '../types/pongTypes';
// import { async } from '../../backend/app/pong/pong';

// let canvas: HTMLCanvasElement;
// let ctx: CanvasRenderingContext2D | null;

// let win_width = window.innerWidth;
// let win_height = window.innerHeight;

export function createPongSocket(): Socket {
	let socket = io('https://localhost:8080');

	socket.on('connect', () => {
		console.log('Socket connected!');
		socket.emit('initGame');
	});

	// socket.emit('joinGame', 'game1');

	// socket.on('gameState', gameState => {

	// 	game = gameState;
	// 	console.log(game);
	// });
	return socket;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameOver = false;

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
	if (!ctx || gameOver) return;
	let scale_x = canvas.width / game.win.width;
	let scale_y = canvas.height / game.win.height;

	ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);
	// Background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);
	// Ball
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.fillRect(game.ball.x * scale_x, game.ball.y * scale_y, game.ball.radius * scale_x, game.ball.radius * scale_y);
	ctx.closePath();
	// Paddles
	ctx.fillRect(game.p1.x * scale_x, game.p1.y * scale_y, game.p1.length * scale_x, game.p1.height * scale_y);
	ctx.fillRect(game.p2.x * scale_x, game.p2.y * scale_y, game.p2.length * scale_x, game.p2.height * scale_y);
	// Net (dashed center line)
	for (let i = 0; i < game.win.height * scale_y; i += 25) {
		ctx.fillRect((game.win.width * scale_x) / 2 - 2, i * scale_y, 4 * scale_x, 15 * scale_y);
	}
	// Scores
	ctx.font = '50px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(game.p1.score.toString(), game.win.width * scale_x * 0.25, 60);
	ctx.fillText(game.p2.score.toString(), game.win.width * scale_x * 0.75, 60);
}

function listenUserInputs(socket: Socket) {
	// Key controls
	window.addEventListener('beforeunload', () => {
		socket.emit('beforeunload', socket);
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
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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

function drawWaitingScreen(game: Game) {
	if (!ctx) return;

	// On utilise les mêmes scales que dans drawGame
	const scale_x = canvas.width / game.win.width;
	const scale_y = canvas.height / game.win.height;

	ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);

	ctx.font = `${40 * scale_y}px Arial`;
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Waiting for player ... (1 / 2)', (game.win.width * scale_x) / 2, (game.win.height * scale_y) / 2);
}

// let waitingAnimationFrame: number | null = null;
// let waitingStartTime: number | null = null;
// let waitingActive = false;

// function drawWaitingScreen(room: any) {
// 	if (!ctx || !waitingActive) return; // <-- Ajout de la condition

// 	const scale_x = canvas.width / room.game.win.width;
// 	const scale_y = canvas.height / room.game.win.height;

// 	if (waitingStartTime === null) waitingStartTime = performance.now();
// 	const elapsed = performance.now() - waitingStartTime;
// 	const dotCount = Math.floor((elapsed / 500) % 4);

// 	const dots = '.'.repeat(dotCount);

// 	ctx.clearRect(0, 0, room.game.win.width * scale_x, room.game.win.height * scale_y);
// 	ctx.fillStyle = 'black';
// 	ctx.fillRect(0, 0, room.game.win.width * scale_x, room.game.win.height * scale_y);

// 	ctx.font = `${40 * scale_y}px Arial`;
// 	ctx.fillStyle = 'white';
// 	ctx.textAlign = 'center';
// 	ctx.textBaseline = 'middle';

// 	ctx.fillText(`Waiting for player (${room.playersNb} / 2) ${dots}`, (room.game.win.width * scale_x) / 2, (room.game.win.height * scale_y) / 2);

// 	// Relance la frame SEULEMENT si l'animation est active
// 	if (waitingActive) {
// 		waitingAnimationFrame = requestAnimationFrame(() => drawWaitingScreen(room.game));
// 	}
// }

// function stopWaitingScreen() {
// 	waitingActive = false;
// 	if (waitingAnimationFrame !== null) {
// 		cancelAnimationFrame(waitingAnimationFrame);
// 		waitingAnimationFrame = null;
// 	}
// 	waitingStartTime = null;
// }

export function pongGame() {
	const socket = createPongSocket();
	initCanvas();

	listenUserInputs(socket);
	// stopWaitingScreen();
	socket.on('waiting', (room: any) => {
		drawWaitingScreen(room);
	});
	socket.on('playerWin', (winner, game) => {
		// stopWaitingScreen();
		if (ctx) {
			console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', winner, game);
			gameOver = true;
			let scale_x = canvas.width / game.win.width;
			let scale_y = canvas.height / game.win.height;
			ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);
			// console.log('scale_x:', scale_x);
			// console.log('scale_y:', scale_y);
			//winner announcement
			ctx.fillStyle = 'white';
			ctx.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
			ctx.fillStyle = 'black';
			ctx.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(winner + ' wins', game.win.width * scale_x * 0.5, game.win.height * scale_y * 0.33);
			return;
		}
	});
	// Main game loop (frame update)

	socket.on('gameState', (game: Game) => {
		// stopWaitingScreen();
		drawGame(game, socket);
	});
}
