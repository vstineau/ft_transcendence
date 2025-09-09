import io, { Socket } from 'socket.io-client';
import { Game, Player } from '../types/pongTypes';
import { navigateTo } from '../main';
// import { Socket } from 'socket.io';

export function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift();
	return null;
}

export function createPongSocket(): Socket {
	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;

	let socket = io(`${protocol}//${host}:${port}/pong`);
	socket.on('connect', () => {
		console.log('socket pong create');
		let cookie = getCookie('token');
		socket.emit('initGame', cookie);
		initCanvas(socket);
	});
	return socket;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameOver = false;
let started = false;

function initCanvas(socket: Socket) {
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	if (!canvas) {
		console.error("❌ Canvas 'gameCanvas' not found");
		return;
	}
	canvas.width = win_width * 0.6;
	canvas.height = win_height * 0.6;
	ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('❌ Failed to get canvas context');
	}
}

export function drawGame(game: Game) {
	if (!ctx || gameOver) return;
	const scale_x = canvas.width / game.win.width;
	const scale_y = canvas.height / game.win.height;

	ctx.clearRect(0, 0, canvas.width, canvas.height); // clear full screen

	// Background (zone de jeu)
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Ball
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.fillRect(
		game.ball.x * scale_x - game.ball.radius / 2,
		game.ball.y * scale_y - game.ball.radius / 2,
		game.ball.radius * scale_x,
		game.ball.radius * scale_y
	);
	ctx.closePath();

	// Paddles
	ctx.fillRect(game.p1.x * scale_x, game.p1.y * scale_y, game.p1.length * scale_x, game.p1.height * scale_y);
	ctx.fillRect(game.p2.x * scale_x, game.p2.y * scale_y, game.p2.length * scale_x, game.p2.height * scale_y);

	// dashed center line
	for (let i = 0; i < canvas.height; i += canvas.height * 0.03) {
		ctx.fillRect(canvas.width / 2 - 2, i, 4 * scale_x, 15 * scale_y);
	}

	// Scores
	ctx.font = '50px Arial';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.fillText(game.p1.score.toString(), canvas.width * 0.25, canvas.height * 0.1);
	ctx.fillText(game.p2.score.toString(), canvas.width * 0.75, canvas.height * 0.1);
}

function listenUserInputs(socket: Socket) {
	window.addEventListener('keypress', e => {
		socket.emit('keypress', { key: e.key });
	});
	window.addEventListener('keydown', e => {
		socket.emit('keydown', { key: e.key }, socket.id);
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
		}
		if (gameOver && e.key === 'Escape') {
			gameOver = false;
			started = false;
			winner = null;
			lastGame = null;
			if (socket && socket.connected) {
				socket.disconnect();
			}
			navigateTo('/dashboard');
		} else if (gameOver && e.key === 'Enter') {
			gameOver = false;
			started = false;
			winner = null;
			lastGame = null;
			if (socket && socket.connected) {
				socket.disconnect();
			}
			navigateTo('/pong/matchmaking/game');
		}
	});

	window.addEventListener('keyup', e => {
		socket.emit('keyup', { key: e.key }, socket.id);
	});

	// Resize handling
	window.addEventListener('resize', () => {
		if (canvas) {
			canvas.width = window.innerWidth * 0.6;
			canvas.height = window.innerHeight * 0.6;
		}
		if (gameOver && winner && lastGame) drawWinner(winner, lastGame);
		// socket.emit('resize');
	});
}

// Variables pour gérer le bouton
let gameOverButton = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	visible: false,
};

// Gestion du clic sur le canvas

function drawWaitingScreen(room: any) {
	if (!ctx || gameOver) return;
	// On utilise les mêmes scales que dans drawGame
	const scale_x = canvas.width / room.game.win.width;
	const scale_y = canvas.height / room.game.win.height;

	ctx.clearRect(0, 0, room.game.win.width * scale_x, room.game.win.height * scale_y);

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, room.game.win.width * scale_x, room.game.win.height * scale_y);

	ctx.font = `${40 * scale_y}px Arial`;
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Waiting for player ... (1 / 2)', (room.game.win.width * scale_x) / 2, (room.game.win.height * scale_y) / 2);
}

function drawWinner(winner: Player, game: Game) {
	if (!ctx) return;
	// game.over = true;
	// gameOver = true;
	let scale_x = canvas.width / game.win.width;
	let scale_y = canvas.height / game.win.height;
	ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);
	// ctx.fillStyle = 'white';
	ctx.fillStyle = 'gray';
	// Couleur de la bordure
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 4; // épaisseur de la bordure
	ctx.fillRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
	ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
	ctx.fillStyle = 'red';
	ctx.fillRect(canvas.width * 0.25, canvas.height * 0.66, canvas.width * 0.5, canvas.height * 0.12);
	ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.66, canvas.width * 0.5, canvas.height * 0.12);
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.font = `${40 * (scale_y < scale_x ? scale_y : scale_y)}px Arial`;
	ctx.fillText(
		winner.nickName + ' wins press `Enter` to play again',
		canvas.width * 0.5,
		canvas.height * 0.33,
		canvas.width * 0.4
	);
	ctx.fillText('Press `Escape` to return to dashboard', canvas.width * 0.5, canvas.height * 0.73, canvas.width * 0.4);
	return;
}

let winner: Player | null = null;
let lastGame: Game | null = null;

export function keyHandler(socket: Socket) {
	let keyUpP1 = document.getElementById('p1keyup');
	let keyDownP1 = document.getElementById('p1keydown');
	let keyUpP2 = document.getElementById('p2keyup');
	let keyDownP2 = document.getElementById('p2keydown');
	// P1 UP
	socket.on('p1UpKeyDown', () => {
		if (keyUpP1)
			keyUpP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	});
	socket.on('p1UpKeyUp', () => {
		if (keyUpP1) keyUpP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	});
	// P1 DOWN
	socket.on('p1DownKeyDown', () => {
		if (keyDownP1)
			keyDownP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	});
	socket.on('p1DownKeyUp', () => {
		if (keyDownP1) keyDownP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	});
	// P2 UP
	socket.on('p2UpKeyDown', () => {
		if (keyUpP2)
			keyUpP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	});
	socket.on('p2UpKeyUp', () => {
		if (keyUpP2) keyUpP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	});
	// P2 DOWN
	socket.on('p2DownKeyDown', () => {
		if (keyDownP2)
			keyDownP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	});
	socket.on('p2DownKeyUp', () => {
		if (keyDownP2) keyDownP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	});
}

export async function pongGame() {
	const socket = createPongSocket();
	listenUserInputs(socket);
	// socket.onAny((eventName, ...args) => {});
	socket.on('notLogged', () => {
		navigateTo('/login?/pong/matchmaking/game');
	});
	socket.on('waiting', (room: any) => {
		drawWaitingScreen(room);
	});
	socket.on('playerWin', (player: Player, game) => {
		if (!gameOver) {
			lastGame = game;
			winner = player;
		}
		gameOver = true;
		if (gameOver && winner && lastGame) {
			drawWinner(winner, lastGame);
		}
	});
	// Main game loop (frame update)
	socket.on('gameState', (game: Game) => {
		if (!started) {
			started = true;
		}
		drawGame(game);
	});
	socket.on('p1Name', (name: string) => {
		const p1name = document.getElementById('p1Name');
		if (p1name) {
			p1name.textContent = name;
		}
	});
	socket.on('p2Name', (name: string) => {
		const p2name = document.getElementById('p2Name');
		if (p2name) {
			p2name.textContent = name;
		}
	});
	keyHandler(socket);
}
