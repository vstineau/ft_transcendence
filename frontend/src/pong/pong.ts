import io, { Socket } from 'socket.io-client';
import { Game } from '../types/pongTypes';
import { navigateTo } from '../main';
// import { async } from '../../backend/app/pong/pong';

// let canvas: HTMLCanvasElement;
// let ctx: CanvasRenderingContext2D | null;

// let win_width = window.innerWidth;
// let win_height = window.innerHeight;
function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(';').shift();
	return null;
}

export function createPongSocket(): Socket {
	// const cookie = getCookie(`token`);
	// if(cookie){
	// console.log(`COOKIE = ` + getCookie(`token`));
	// }
	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;

	let socket = io(`${protocol}//${host}:${port}`);
	socket.on('connect', () => {
		initCanvas(socket);
		console.log('Socket connected!');
		socket.emit('initGame', getCookie);
	});
	return socket;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
// let gameWidth = win_width * 0.8;
// let gameHeight = win_height * 0.8;
let gameOver = false;

function initCanvas(socket: Socket) {
	canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	if (!canvas) {
		console.error("❌ Canvas 'gameCanvas' not found");
		return;
	}
	canvas.width = win_width * 0.8;
	canvas.height = win_height * 0.8;
	ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('❌ Failed to get canvas context');
	}
}

function drawGame(game: Game) {
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

	// Net (dashed center line)
	// console.log(`canvas.height = ${canvas.height}`);
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
	// Key controls
	// let id = socket.id
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
		// let id = socket.id
		// console.log(`KEYDOWN -> sock.id = ${socket.id}, key = ${e.key}`);

		socket.emit('keydown', { key: e.key }, socket.id);
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
		}
	});

	window.addEventListener('keyup', e => {
		// console.log(`KEYUP -> sock.id = ${socket.id}, key = ${e.key}`);
		// let id = socket.id
		// console.log(`KEYUP -> socket id = ${socket.id}`);
		// console.log(`KEYUP -> socket id = ${socket.id}`);
		// socket.emit('keyup', { key: e.key});
		socket.emit('keyup', { key: e.key }, socket.id);
	});

	// Resize handling
	window.addEventListener('resize', () => {
		// win_width = window.innerWidth;
		// win_height = window.innerHeight;
		if (canvas) {
			canvas.width = window.innerWidth * 0.8;
			canvas.height = window.innerHeight * 0.8;
		}
		socket.emit('resize');
	});
}

// function removeEvlistenner() {
// 	// Key controls
// 	window.removeEventListener('beforeunload', () => {});
// 	window.removeEventListener('keypress', () => {});
// 	window.removeEventListener('keydown', () => {});
// 	window.removeEventListener('keyup', () => {});
// 	window.removeEventListener('resize', () => {});
// }

// Variables pour gérer le bouton
let gameOverButton = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	visible: false,
};

function drawGameOverScreen(game: Game) {
	if (!ctx) return;

	const scale_x = canvas.width / game.win.width;
	const scale_y = canvas.height / game.win.height;

	// Nettoyage du canvas
	ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);

	// Message Game Over
	ctx.font = `${50 * scale_y}px Arial`;
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Game Over', (game.win.width * scale_x) / 2, (game.win.height * scale_y) / 2 - 60 * scale_y);

	// Dessin du bouton
	const btnWidth = 300 * scale_x;
	const btnHeight = 80 * scale_y;
	const btnX = (game.win.width * scale_x) / 2 - btnWidth / 2;
	const btnY = (game.win.height * scale_y) / 2 + 40 * scale_y;

	ctx.fillStyle = '#1976d2'; // Bleu
	ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

	ctx.font = `${32 * scale_y}px Arial`;
	ctx.fillStyle = 'white';
	ctx.fillText("Retour à l'accueil", (game.win.width * scale_x) / 2, btnY + btnHeight / 2);

	// Stockage des coordonnées du bouton pour gestion du clic
	gameOverButton = {
		x: btnX,
		y: btnY,
		width: btnWidth,
		height: btnHeight,
		visible: true,
	};
}

// Gestion du clic sur le canvas

function drawWaitingScreen(room: any) {
	if (!ctx) return;
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

export function pongGame() {
	// fetch(`/game/matchmaking`)
	const socket = createPongSocket();
	// initCanvas(socket);

	listenUserInputs(socket);
	socket.on('waiting', (room: any) => {
		drawWaitingScreen(room);
	});
	socket.on('playerWin', (winner, game) => {
		if (!ctx) return;
		gameOver = true;
		let scale_x = canvas.width / game.win.width;
		let scale_y = canvas.height / game.win.height;
		ctx.clearRect(0, 0, game.win.width * scale_x, game.win.height * scale_y);
		ctx.fillStyle = 'white';
		ctx.fillRect(canvas.width * 0.1, canvas.height * 0.25, canvas.width * 0.8, canvas.height * 0.12);
		ctx.fillStyle = 'black';
		ctx.fillRect(canvas.width * 0.105, canvas.height * 0.26, canvas.width * 0.79, canvas.height * 0.1);
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.font = `${40 * scale_y}px Arial`;
		ctx.fillText(winner + ' wins', canvas.width * 0.5, canvas.height * 0.33);
		return;
	});
	// Main game loop (frame update)

	socket.on('gameState', (game: Game) => {
		drawGame(game);
	});

	socket.on('gameOver', (room: any) => {
		window.addEventListener('click', function (event) {
			if (!gameOverButton.visible) return;
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			if (
				x >= gameOverButton.x &&
				x <= gameOverButton.x + gameOverButton.width &&
				y >= gameOverButton.y &&
				y <= gameOverButton.y + gameOverButton.height
			) {
				// Action : Retour à l'accueil
				gameOverButton.visible = false;
				// Redirection exemple :
				navigateTo('/'); // Change la route selon ton app
			}
		});
		drawGameOverScreen(room.game);
	});
}
