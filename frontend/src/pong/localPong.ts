// import { Game } from '../types/pongTypes';
// import { navigateTo } from '../main';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;

let p1 = {
	name: 'player 1',
	y: win_height / 2,
	x: 20,
	height: win_height / 9,
	length: win_width / 90,
	vy: win_height / 150,
	score: 0,
};
let p2 = {
	name: 'player 2',
	y: win_height / 2,
	x: win_width * 0.98,
	height: win_height / 9,
	length: win_width / 90,
	vy: win_height / 150,
	score: 0,
};
let ball = {
	x: win_width / 2,
	y: win_height / 2,
	radius: (win_height * win_width) / 80000,
	vx: 0,
	vy: 0,
};
let key_w = false,
	key_s = false,
	key_up = false,
	key_down = false;

function updateInfos() {
	ball.x = win_width / 2;
	ball.y = win_height / 2;

	// updting ball properties
	ball.vx = (Math.random() < 0.5 ? -1 : 1) * (win_width / 280);
	ball.vy = (Math.random() < 0.5 ? -1 : 1) * (win_height / 180);
	ball.radius = (win_height * win_width) / 80000;
	if (ball.radius < 5) ball.radius = 5;
	if (ball.radius > 30) ball.radius = 30;

	// updating players positions
	p1.y = win_height / 2;
	p2.y = win_height / 2;
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
	ctx!.fillStyle = 'black';
	ctx!.fillRect(0, 0, win_width, win_height);
	ctx!.save();
	ctx!.beginPath();
	ctx!.lineWidth = 5;
	ctx!.fillStyle = 'white';
	ctx!.fillRect(ball.x, ball.y, ball.radius, ball.radius);
	ctx!.fill();
	ctx!.lineWidth = 4;
	ctx!.stroke();
	ctx!.fillRect(p1.x, p1.y, p1.length, p1.height);
	ctx!.fillRect(p2.x, p2.y, p2.length, p2.height);
	ctx!.stroke();
	for (let height = 0; height < win_height; height += 0) {
		ctx!.fillRect(win_width / 2, height, 5, 10);
		height += 15;
		ctx!.stroke();
	}
	ctx!.font = '50px Arial';
	ctx!.fillText(p1.score.toString(), win_width * 0.25, win_height * 0.1);
	ctx!.fillText(p2.score.toString(), win_width * 0.75, win_height * 0.1);
	ctx!.fillStyle = 'white';
	ctx!.textAlign = 'center';
}

function movePlayer() {
	if (key_w === true && p1.y - p1.vy >= -10) p1.y -= p1.vy;
	if (key_s === true && p1.y + p1.vy <= win_height - p1.height) p1.y += p1.vy;
	if (key_up === true && p2.y - p2.vy >= -10) p2.y -= p2.vy;
	if (key_down === true && p2.y + p2.vy <= win_height - p2.height) p2.y += p2.vy;
}

function checkWin() {
	if (p1.score === 3 || p2.score === 3) {
		ball.vx = 0;
		ball.vy = 0;
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ctx!.fillStyle = 'white';
		ctx!.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
		ctx!.fillStyle = 'black';
		ctx!.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
		ctx!.fillStyle = 'white';
		ctx!.textAlign = 'center';
		if (p1.score === 3) {
			ctx!.fillText(p1.name + ' wins', win_width * 0.5, win_height * 0.33);
		}
		if (p2.score === 3) {
			ctx!.fillText(p2.name + ' wins', win_width * 0.5, win_height * 0.33);
		}
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
		console.log(ball.vy);

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
		console.log(ball.vy);

		if (Math.abs(ball.vx) < 30) ball.vx += ball.vx > 0 ? 1.5 : -1.5;
	}
}

export function gameLoop(_socket: any) {
	requestAnimationFrame(gameLoop);
	win_width = window.innerWidth;
	win_height = window.innerHeight;
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

export function localpongGame() {
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
	});

	// window.addEventListener('keypress', e => {
	// 	if (e.key === ' ') {
	// 		e.preventDefault();
	// 		p1.score = 0;
	// 		p2.score = 0;
	// 		updateInfos();
	// 	}
	// });

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
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		win_width = window.innerWidth;
		win_height = window.innerHeight;

		updateInfos();
	});

	const initGame = () => {
		canvas = document.getElementById('localgameCanvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		if (!canvas) {
			console.error("Canvas 'game' not found");
			return;
		}
		ctx = canvas.getContext('2d');
		updateInfos();
		gameLoop(canvas);
	};
	initGame();
}
