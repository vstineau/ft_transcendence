import { navigateTo } from '../main';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameWidth = win_width * 0.6;
let gameHeight = win_height * 0.6;

let p1 = {
	name: 'player 1',
	y: gameHeight / 2,
	x: 20,
	height: gameHeight / 9,
	length: gameWidth / 90,
	vy: gameHeight / 150,
	score: 0,
};

let p2 = {
	name: 'player 2',
	y: gameHeight / 2,
	x: gameWidth - 20,
	height: gameHeight / 9,
	length: gameWidth / 90,
	vy: gameHeight / 150,
	score: 0,
};

let ball = {
	x: gameWidth / 2,
	y: gameHeight / 2,
	radius: (gameHeight * gameWidth) / 80000,
	vx: 0,
	vy: 0,
};

let key_w = false,
	key_s = false,
	key_up = false,
	key_down = false;

let gameOver = false;

function updateInfos() {
	ball.x = win_width / 2 - ball.radius / 2;
	ball.y = win_height / 2 - ball.radius / 2;

	// updting ball properties
	ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
	ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
	ball.radius = (win_height * win_width) / 80000;
	if (ball.radius < 5) ball.radius = 5;
	if (ball.radius > 30) ball.radius = 30;

	// updating players positions
	p1.y = win_height / 2 - p1.height / 2;
	p2.y = win_height / 2 - p1.height / 2;
	p2.x = win_width * 0.98;

	// updating players properties
	p1.height = win_height / 9;
	p1.length = win_width / 90;
	p1.vy = win_height / 100;

	p2.height = win_height / 9;
	p2.length = win_width / 90;
	p2.vy = win_height / 100;
}

function drawGame() {
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.lineWidth = 5;
	ctx.fillRect(
		(ball.x / win_width) * canvas.width,
		(ball.y / win_height) * canvas.height,
		(ball.radius / win_width) * canvas.width,
		(ball.radius / win_height) * canvas.height
	);
	// Dessine les joueurs (en ajoutant le décalage)
	ctx.fillRect(
		(p1.x / win_width) * canvas.width,
		(p1.y / win_height) * canvas.height,
		(p1.length / win_width) * canvas.width,
		(p1.height / win_height) * canvas.height
	);
	ctx.fillRect(
		(p2.x / win_width) * canvas.width,
		(p2.y / win_height) * canvas.height,
		(p2.length / win_width) * canvas.width,
		(p2.height / win_height) * canvas.height
	);

	// Ligne centrale en pointillés
	for (let height = 0; height < canvas.height; height += 15) {
		ctx.fillRect(canvas.width / 2 - 2, height, 5, 10);
	}
	// Scores en relatif à la zone de jeu
	const px = (canvas.height * canvas.width) / 35000 > 20 ? (canvas.height * canvas.width) / 35000 : 20;
	ctx.font = `${px}px Arial`;
	// ctx.font = '50px Arial';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.fillText(p1.score.toString(), canvas.width * 0.25, canvas.height * 0.07);
	ctx.fillText(p2.score.toString(), canvas.width * 0.75, canvas.height * 0.07);

	ctx.restore();
}
// }

function movePlayer() {
	if (key_w === true && p1.y - p1.vy >= 1) p1.y -= p1.vy;
	if (key_s === true && p1.y + p1.vy <= win_height - p1.height) p1.y += p1.vy;
	if (key_up === true && p2.y - p2.vy >= 1) p2.y -= p2.vy;
	if (key_down === true && p2.y + p2.vy <= win_height - p2.height) p2.y += p2.vy;
}

function checkWin() {
	if ((p1.score === 3 || p2.score === 3) && ctx) {
		gameOver = true;
		const px = (canvas.height * canvas.width) / 35000;
		// console.log(px);
		ball.vx = 0;
		ball.vy = 0;
		ball.x = win_width / 2 - ball.radius / 2;
		ball.y = win_height / 2 - ball.radius / 2;
		ctx.fillStyle = 'gray';
		// Couleur de la bordure
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 4; // épaisseur de la bordure

		// Dessine le rectangle plein
		ctx.fillRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
		ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
		ctx.fillStyle = 'red';
		ctx.fillRect(canvas.width * 0.25, canvas.height * 0.66, canvas.width * 0.5, canvas.height * 0.12);
		ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.66, canvas.width * 0.5, canvas.height * 0.12);

		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.font = `${px}px Arial`;
		ctx.fillText(
			(p1.score > p2.score ? p1.name : p2.name) + ' wins, press `Enter` to restart game',
			canvas.width * 0.5,
			canvas.height * 0.32,
			canvas.width * 0.4
		);
		ctx.fillText('Press `Escape` to return to dashboard', canvas.width * 0.5, canvas.height * 0.73, canvas.width * 0.4);

		return;
	}
}

function handlePaddleCollisionP1() {
	const collision =
		ball.x > p1.x && ball.x < p1.x + p1.length && ball.y + ball.radius > p1.y && ball.y - ball.radius < p1.y + p1.height;

	if (collision) {
		ball.vx = -ball.vx;

		const impactPoint = (ball.y - (p1.y + p1.height / 2)) / (p1.height / 2);
		ball.vy += impactPoint * 3;
		// console.log(ball.vy);

		if (Math.abs(ball.vx) < 30) ball.vx += ball.vx > 0 ? 1.5 : -1.5;
	}
}

function handlePaddleCollisionP2() {
	const collision =
		ball.x + ball.radius > p2.x &&
		ball.x - ball.radius < p2.x + p2.length &&
		ball.y + ball.radius > p2.y &&
		ball.y - ball.radius < p2.y + p2.height;

	if (collision) {
		ball.vx = -ball.vx;

		const impactPoint = (ball.y - (p2.y + p2.height / 2)) / (p2.height / 2);
		ball.vy += impactPoint * 3;
		// console.log(ball.vy);

		if (Math.abs(ball.vx) < 30) ball.vx += ball.vx > 0 ? 1.5 : -1.5;
	}
}

function gameLoop(canvas: HTMLCanvasElement) {
	// requestAnimationFrame(gameLoop);
	// win_width = canvas.width;
	// win_height = canvas.height;
	drawGame();
	movePlayer();
	checkWin();

	// ball movement
	ball.x += ball.vx;
	ball.y += ball.vy;

	// collision celling
	if (ball.y <= 0 || ball.y >= win_height - ball.radius) {
		ball.vy = -ball.vy;
	}
	handlePaddleCollisionP1();
	handlePaddleCollisionP2();
	if (ball.x < 0) {
		p2.score += 1;
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
		ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
	}
	if (ball.x > win_width) {
		p1.score += 1;
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
		ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
	}
}

function handleKeyDown(e: KeyboardEvent) {
	let keyUpP1 = document.getElementById('p1keyup');
	let keyDownP1 = document.getElementById('p1keydown');
	let keyUpP2 = document.getElementById('p2keyup');
	let keyDownP2 = document.getElementById('p2keydown');

	if (e.key === 'w' || e.key === 'W') {
		if (keyUpP1)
			keyUpP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 's' || e.key === 'S') {
		if (keyDownP1)
			keyDownP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault();
		if (keyUpP2)
			keyUpP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		if (keyDownP2)
			keyDownP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
}

// key handler for key up
function handleKeyUp(e: KeyboardEvent) {
	let keyUpP1 = document.getElementById('p1keyup');
	let keyDownP1 = document.getElementById('p1keydown');
	let keyUpP2 = document.getElementById('p2keyup');
	let keyDownP2 = document.getElementById('p2keydown');

	if (e.key === 'w' || e.key === 'W') {
		if (keyUpP1) keyUpP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 's' || e.key === 'S') {
		if (keyDownP1) keyDownP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault();
		if (keyUpP2) keyUpP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		if (keyDownP2) keyDownP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
}

function listenInputs() {
	window.addEventListener('keydown', e => {
		if (e.key === 'w' || e.key === 'W') key_w = true;
		if (e.key === 's' || e.key === 'S') key_s = true;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			key_up = true;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			key_down = true;
		}
		if (e.key === 'Enter' && gameOver) {
			gameOver = false;
			updateInfos();
			p1.score = 0;
			p2.score = 0;
		}
		if (e.key === 'Escape' && gameOver) {
			navigateTo('/dashboard');
		}
	});

	window.addEventListener('keyup', e => {
		if (e.key === 'w' || e.key === 'W') key_w = false;
		if (e.key === 's' || e.key === 'S') key_s = false;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			key_up = false;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			key_down = false;
		}
	});

	window.addEventListener('resize', () => {
		canvas.width = window.innerWidth * 0.6;
		canvas.height = window.innerHeight * 0.6;
		win_width = canvas.width;
		win_height = canvas.height;
		// gameWidth = canvas.width;
		// gameHeight = canvas.height;

		updateInfos();
	});
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
}

function initGame() {
	canvas = document.getElementById('localgameCanvas') as HTMLCanvasElement;
	canvas.width = window.innerWidth * 0.6;
	canvas.height = window.innerHeight * 0.6;
	if (!canvas) {
		console.log("Canvas 'game' not found");
		return;
	}
	ctx = canvas.getContext('2d');
	updateInfos();
}

let mainLoop: NodeJS.Timeout | undefined;

function startMainLoop() {
	if (mainLoop) {
		clearInterval(mainLoop);
		mainLoop = undefined;
	}
	mainLoop = setInterval(() => {
		gameLoop(canvas);
	}, 1000 / 60);
}

export function localpongGame() {
	listenInputs();
	initGame();
	startMainLoop();
}
