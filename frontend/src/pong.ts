import io, { Socket } from 'socket.io-client';
import { Game } from '../src/types/pongTypes';
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

// // let p1 = {
// // 	name: 'player 1',
// // 	y: win_height / 2,
// // 	x: 20,
// // 	height: win_height / 9,
// // 	length: win_width / 90,
// // 	vy: win_height / 150,
// // 	score: 0,
// // };
// // let p2 = {
// // 	name: 'player 2',
// // 	y: win_height / 2,
// // 	x: win_width * 0.98,
// // 	height: win_height / 9,
// // 	length: win_width / 90,
// // 	vy: win_height / 150,
// // 	score: 0,
// // };
// // let ball = {
// // 	x: win_width / 2,
// // 	y: win_height / 2,
// // 	radius: (win_height * win_width) / 80000,
// // 	vx: 0,
// // 	vy: 0,
// // };
// // let key_w = false,
// // 	key_s = false,
// // 	key_up = false,
// // 	key_down = false;

// // function updateInfos() {
// // 	ball.x = win_width / 2;
// // 	ball.y = win_height / 2;

// // 	// updting ball properties
// // 	ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
// // 	ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
// // 	ball.radius = (win_height * win_width) / 80000;
// // 	if (ball.radius < 5) ball.radius = 5;
// // 	if (ball.radius > 30) ball.radius = 30;

// // 	// updating players positions
// // 	p1.y = win_height / 2;
// // 	p2.y = win_height / 2;
// // 	p2.x = win_width * 0.98;

// // 	// updating players properties
// // 	p1.height = win_height / 9;
// // 	p1.length = win_width / 90;
// // 	p1.vy = win_height / 100;

// // 	p2.height = win_height / 9;
// // 	p2.length = win_width / 90;
// // 	p2.vy = win_height / 100;
// // }

// async function drawGame(stats: Game) {
// 	// console.log(stats);
// 	if (!ctx || !canvas) {
// 		console.error('Canvas or context not initialized');
// 		return;
// 	}
// 	ctx.fillStyle = 'black';
// 	ctx.fillRect(0, 0, win_width, win_height);
// 	ctx.save();
// 	ctx.beginPath();
// 	ctx.lineWidth = 5;
// 	ctx.fillStyle = 'white';
// 	ctx.fillRect(stats.ball.x, stats.ball.y, stats.ball.radius, stats.ball.radius);
// 	ctx.fill();
// 	ctx.lineWidth = 4;
// 	ctx.stroke();
// 	ctx.fillRect(stats.p1.x, stats.p1.y, stats.p1.length, stats.p1.height);
// 	ctx.fillRect(stats.p2.x, stats.p2.y, stats.p2.length, stats.p2.height);
// 	ctx.stroke();
// 	for (let height = 0; height < win_height; height += 0) {
// 		ctx.fillRect(win_width / 2, height, 5, 10);
// 		height += 15;
// 		ctx.stroke();
// 	}
// 	ctx.font = '50px Arial';
// 	ctx.fillText(stats.p1.score.toString(), win_width * 0.25, win_height * 0.1, (win_height * win_height) / 100000);
// 	ctx.fillText(stats.p2.score.toString(), win_width * 0.75, win_height * 0.1, (win_height * win_height) / 100000);
// 	ctx.fillStyle = 'white';
// 	ctx.textAlign = 'center';
// }

// // function movePlayer() {
// // 	if (key_w === true && p1.y - p1.vy >= -10) p1.y -= p1.vy;
// // 	if (key_s === true && p1.y + p1.vy <= win_height - p1.height) p1.y += p1.vy;
// // 	if (key_up === true && p2.y - p2.vy >= -10) p2.y -= p2.vy;
// // 	if (key_down === true && p2.y + p2.vy <= win_height - p2.height) p2.y += p2.vy;
// // }

// // function checkWin() {
// // 	if (p1.score === 1 || p2.score === 1) {
// // 		ball.vx = 0;
// // 		ball.vy = 0;
// // 		ball.x = win_width / 2;
// // 		ball.y = win_height / 2;
// // 		ctx!.fillStyle = 'white';
// // 		ctx!.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
// // 		ctx!.fillStyle = 'black';
// // 		ctx!.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
// // 		ctx!.fillStyle = 'white';
// // 		ctx!.textAlign = 'center';
// // 		if (p1.score === 1) {
// // 			ctx!.fillText(p1.name + ' wins', win_width * 0.5, win_height * 0.33);
// // 		}
// // 		if (p2.score === 1) {
// // 			ctx!.fillText(p2.name + ' wins', win_width * 0.5, win_height * 0.33);
// // 		}
// // 		return;
// // 	}
// // }

// // function handlePaddleCollisionP1() {
// // 	const collision =
// // 		ball.x > p1.x && ball.x < p1.x + p1.length && ball.y + ball.radius > p1.y && ball.y - ball.radius < p1.y + p1.height;

// // 	if (collision) {
// // 		ball.vx = -ball.vx;

// // 		const impactPoint = (ball.y - (p1.y + p1.height / 2)) / (p1.height / 2);
// // 		ball.vy += impactPoint * 3;
// // 		// console.log(ball.vy);

// // 		if (Math.abs(ball.vx) < 40) ball.vx += ball.vx > 0 ? 1.5 : -1.5;
// // 	}
// // }

// // function handlePaddleCollisionP2() {
// // 	const collision =
// // 		ball.x + ball.radius > p2.x &&
// // 		ball.x - ball.radius < p2.x + p2.length &&
// // 		ball.y + ball.radius > p2.y &&
// // 		ball.y - ball.radius < p2.y + p2.height;

// // 	if (collision) {
// // 		ball.vx = -ball.vx;

// // 		const impactPoint = (ball.y - (p2.y + p2.height / 2)) / (p2.height / 2);
// // 		ball.vy += impactPoint * 3;
// // 		console.log(ball.vy);

// // 		if (Math.abs(ball.vx) < 40) ball.vx += ball.vx > 0 ? 1.5 : -1.5;
// // 	}
// // }

// export async function gameLoop(stats: Game) {
// 	// requestAnimationFrame(gameLoop);
// 	win_width = window.innerWidth;
// 	win_height = window.innerHeight;
// 	await drawGame(stats);
// 	// movePlayer();
// 	// checkWin();
// 	// // ball movement
// 	// ball.x += ball.vx;
// 	// ball.y += ball.vy;

// 	// collision celling
// 	// if (ball.y <= 0 || ball.y >= win_height - ball.radius) {
// 	// 	ball.vy = -ball.vy;
// 	// }
// 	// handlePaddleCollisionP1();
// 	// handlePaddleCollisionP2();
// 	// if (ball.x < 0) {
// 	// 	p2.score += 1;
// 	// 	ball.x = win_width / 2;
// 	// 	ball.y = win_height / 2;
// 	// 	ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
// 	// 	ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
// 	// }
// 	// if (ball.x > win_width) {
// 	// 	p1.score += 1;
// 	// 	ball.x = win_width / 2;
// 	// 	ball.y = win_height / 2;
// 	// 	ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
// 	// 	ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
// 	// }
// }

// export async function pongGame() {
// 	// let stats: Game;
// 	const sock: Socket = createPongSocket();
// 	window.addEventListener('keydown', e => {
// 		sock.emit('keydown', e.key);
// 		// sock.setMaxListeners(20);
// 		// if (e.key === 'w' || e.key === 'W') sock.emit('keydown_w', e);
// 		// if (e.key === 's' || e.key === 'S') sock.emit('keydown_s');
// 		if (e.key === 'ArrowUp') {
// 			e.preventDefault();
// 			// sock.emit('keydown_up')
// 		}
// 		if (e.key === 'ArrowDown') {
// 			e.preventDefault();
// 			// sock.emit('keydown_down')
// 		}
// 	});

// 	window.addEventListener('keypress', e => {
// 		if (e.key === ' ') {
// 			sock.emit('keypress', e.key);
// 			e.preventDefault();
// 			// p1.score = 0;
// 			// p2.score = 0;
// 			// updateInfos();
// 		}
// 	});

// 	window.addEventListener('keyup', e => {
// 		sock.emit('keyup', e.key);
// 		// if (e.key === 'w' || e.key === 'W') sock.emit('keyup_w');
// 		// if (e.key === 's' || e.key === 'S') sock.emit('keyup_w');
// 		// if (e.key === 'ArrowUp') {
// 		// 	e.preventDefault();
// 		// 	// key_up = false;
// 		// 	sock.emit('keyup_w')
// 		// }
// 		// if (e.key === 'ArrowDown') {
// 		// 	e.preventDefault();
// 		// 	// key_down = false;
// 		// 	sock.emit('keyup_w')
// 		// }
// 	});

// 	window.addEventListener('resize', () => {
// 		sock.emit('resize');
// 		canvas.width = window.innerWidth;
// 		canvas.height = window.innerHeight;
// 		win_width = window.innerWidth;
// 		win_height = window.innerHeight;

// 		// updateInfos();
// 	});
// 	sock.on('gameState', gameState => {
// 		const stats = gameState;
// 		// console.log(stats);
// 		// console.log(stats);

// 		const startGame = () => {
// 			canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
// 			canvas.width = window.innerWidth;
// 			canvas.height = window.innerHeight;
// 			if (!canvas) {
// 				console.error("Canvas 'game' not found");
// 				return;
// 			}
// 			ctx = canvas.getContext('2d');
// 			// updateInfos();
// 			gameLoop(stats);
// 		};
// 		startGame();
// 	});
// }

/////////////////////////////////

// import { createPongSocket } from './createPongSocket';
// import { Game } from '../src/types/pongTypes';

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
		console.error("❌ Failed to get canvas context");
	}
}

function drawGame(stats: Game) {
	if (!ctx) return;

	ctx.clearRect(0, 0, stats.win.width, stats.win.height);

	// Background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, stats.win.width, stats.win.height);

	// Ball
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.fillRect(stats.ball.x, stats.ball.y, stats.ball.radius, stats.ball.radius);
	ctx.closePath();

	// Paddles
	ctx.fillRect(stats.p1.x, stats.p1.y, stats.p1.length, stats.p1.height);
	ctx.fillRect(stats.p2.x, stats.p2.y, stats.p2.length, stats.p2.height);

	// Net (dashed center line)
	for (let i = 0; i < stats.win.height; i += 25) {
		ctx.fillRect(stats.win.width / 2 - 2, i, 4, 15);
	}

	// Scores
	ctx.font = '50px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(stats.p1.score.toString(), stats.win.width * 0.25, 60);
	ctx.fillText(stats.p2.score.toString(), stats.win.width * 0.75, 60);
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
		drawGame(stats);
	});
}

