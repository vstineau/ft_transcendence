import  io  from  'socket.io-client';

export function createPongSocket(): any {
	const socket = io('https://localhost:8080');

	socket.on('connection', () => {
	  console.log('Socket connected!');
	});

	socket.emit('joinGame', 'game1');
	

	socket.on("gamestate", (state) => {
	  console.log(state); 
	});
	return socket;
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

const win_width = 1920;
const win_height = 930;

// function sleep(ms: number): Promise<void> {
// 	return new Promise(resolve => setTimeout(resolve, ms));
// }

let p1 = { y: win_height / 2, x: 20, height: 120, length: 20, vy: 7, score: 0 };
let p2 = { y: win_height / 2, x: win_width * 0.98, height: 120, length: 20, vy: 7, score: 0 };
let ball = { x: win_width / 2, y: win_height / 2, radius: 25, vx: 0, vy: 0 };
let key_w = false,
	key_s = false,
	key_up = false,
	key_down = false;

export function gameLoop(_socket: any) {
	requestAnimationFrame(gameLoop);
	ctx!.fillStyle = 'black';
	ctx!.fillRect(0, 0, win_width, win_height);
	ctx!.save();
	ctx!.beginPath();
	ctx!.lineWidth = 5;
	// ctx!.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx!.fillStyle = 'white';
	ctx!.fillRect(ball.x, ball.y, ball.radius, ball.radius);
	ctx!.fill();
	ctx!.lineWidth = 4;
	ctx!.stroke();
	// ctx!.fillStyle = 'white';
	ctx!.fillRect(p1.x, p1.y, p1.length, p1.height);
	ctx!.fillRect(p2.x, p2.y, p2.length, p2.height);
	// let myObstacle = new component(10, 200, "green", 300, 120);
	ctx!.stroke();
	//
	for (let height = 0; height < win_height; height += 0) {
		ctx!.fillRect(win_width / 2, height, 5, 10);
		height += 15;
		ctx!.stroke();
	}
	//
	ctx!.font = '50px Arial';
	ctx!.fillText(p1.score.toString(), win_width * 0.25, win_height * 0.1);
	ctx!.fillText(p2.score.toString(), win_width * 0.75, win_height * 0.1);
	// player movement
	if (key_w === true && p1.y - p1.vy >= -10) p1.y -= p1.vy;
	if (key_s === true && p1.y + p1.vy <= win_height - p1.height) p1.y += p1.vy;
	if (key_up === true && p2.y - p2.vy >= -10) p2.y -= p2.vy;
	if (key_down === true && p2.y + p2.vy <= win_height - p2.height) p2.y += p2.vy;

	if (p1.score === 5 || p2.score === 5) {
		ball.vx = 0;
		ball.vy = 0;
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ctx!.fillStyle = 'white';
		ctx!.fillRect(win_width * 0.1, win_height * 0.25, win_width * 0.8, win_height * 0.12);
		ctx!.fillStyle = 'black';
		// while(1){
		ctx!.fillRect(win_width * 0.105, win_height * 0.26, win_width * 0.79, win_height * 0.1);
		// }
		ctx!.fillStyle = 'white';
		ctx!.textAlign = 'center';
		if (p1.score === 5) {
			ctx!.fillText('Player 1 Wins', win_width * 0.5, win_height * 0.33);
		}
		if (p2.score === 5) {
			ctx!.fillText('Player 2 Wins', win_width * 0.5, win_height * 0.33);
		}
		return;
	}
	// ball movement
	ball.x += ball.vx;
	ball.y += ball.vy;

	// collision celling
	if (ball.y <= 0 || ball.y >= win_height - ball.radius) {
		ball.vy = -ball.vy;
	}
	if (ball.x >= p1.x && ball.x <= p1.x + p1.length) {
		// collision sur le haut de la raquette
		if (ball.y + ball.radius >= p1.y && ball.y < p1.y) {
			ball.y = p1.y - ball.radius; // repositionne la balle au-dessus
			ball.vy = -ball.vy;
			if (ball.vx < 55) ball.vx += 1.5;
		}

		// collision sur le bas de la raquette
		if (ball.y - ball.radius <= p1.y + p1.height && ball.y > p1.y + p1.height) {
			ball.y = p1.y + p1.height + ball.radius; // repositionne la balle en dessous
			ball.vy = -ball.vy;
			if (ball.vx < 55) ball.vx += 1.5;
		}
		// sleep(100);
	}
	// collision avec p2 (joueur 2)
	if (ball.x >= p2.x && ball.x <= p2.x + p2.length) {
		// collision sur le haut de la raquette
		if (ball.y + ball.radius >= p2.y && ball.y < p2.y) {
			ball.y = p2.y - ball.radius;
			ball.vy = -ball.vy;
			if (ball.vx < 55) ball.vx += 1.5;
		}
		// collision sur le bas de la raquette
		if (ball.y - ball.radius <= p2.y + p2.height && ball.y > p2.y + p2.height) {
			ball.y = p2.y + p2.height + ball.radius;
			if (ball.vx < 55) ball.vx += 1.5;
			ball.vy = -ball.vy;
		}
		// sleep(100);
	}
	// collision player 1
	if (ball.x >= p1.x && ball.x <= p1.x + p1.length) {
		if (
			ball.y >= p1.y &&
			ball.y <= p1.y + p1.height &&
			ball.y + ball.radius >= p1.y &&
			ball.y + ball.radius <= p1.y + p1.height
		) {
			ball.vx = -ball.vx;
			if (ball.vx < 55) ball.vx += 1.5;
		}
		// sleep(100);
	}
	// collision player 2
	if (ball.x >= p2.x - ball.radius && ball.x <= p2.x + p2.length + ball.radius) {
		if (ball.y >= p2.y && ball.y <= p2.y + p2.height) {
			if (ball.vx < 55) ball.vx += 1.5;
			ball.vx = -ball.vx;
		}
		// sleep(100);
	}
	if (ball.x < 0) {
		p2.score += 1;
		//console.log(ball.vx);
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ball.vx = (Math.random() < 0.5 ? -1 : 1) * 7;
		ball.vy = (Math.random() < 0.5 ? -1 : 1) * 6;
	}
	if (ball.x > win_width) {
		p1.score += 1;
		//console.log(ball.vx);
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		ball.vx = (Math.random() < 0.5 ? -1 : 1) * 7;
		ball.vy = (Math.random() < 0.5 ? -1 : 1) * 6;
	}
}

export function pongGame() {
	// Initialisation directe, sans attendre onload
	window.addEventListener('keydown', e => {
		//console.log(e);
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

	window.addEventListener('keypress', e => {
		console.log(e);
		if (e.key === ' ') {
			e.preventDefault();
			p1.score = 0;
			p2.score = 0;
			ball.x = win_width / 2;
			ball.y = win_height / 2;
			ball.vx = (Math.random() < 0.5 ? -1 : 1) * 7;
			ball.vy = (Math.random() < 0.5 ? -1 : 1) * 6;
			ball.radius = 25;
		}
	});

	window.addEventListener('keyup', e => {
		//console.log(e);
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

	const initGame = () => {

		canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		if (!canvas) {
			console.error("Canvas 'game' not found");
			return;
		}
		ctx = canvas.getContext('2d');
		ball.vx = (Math.random() < 0.5 ? -1 : 1) * 7;
		ball.vy = (Math.random() < 0.5 ? -1 : 1) * 6;
		ball.x = win_width / 2;
		ball.y = win_height / 2;
		gameLoop(createPongSocket());
	};
	initGame();
}
