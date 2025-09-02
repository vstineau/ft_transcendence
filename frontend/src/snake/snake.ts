import io, { Socket } from 'socket.io-client';
import { Game ,Snake} from '../types/snakeTypes';
import { navigateTo } from '../main'


let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameOver = false;
let started = false;

function getCookie(name: string): string | null {
	return document.cookie
		.split('; ')
		.find(row => row.startsWith(name + '='))
		?.split('=')[1] || null;
}

export function createSnakeSocket(): Socket {
	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;
	let socket = io(`${protocol}//${host}:${port}`);
	socket.on('connect', () => {
		let cookie = getCookie('token');
		console.log(cookie);
		socket.emit('isConnected', cookie);
		socket.emit('initGame_snake');
	});
    return socket;
}


function initCanvas() {
	canvas = document.getElementById('SnakeGameCanvas') as HTMLCanvasElement;
	if (!canvas) {
		console.error("❌ Canvas 'SnakeGameCanvas' not found");
		return;
	}
	canvas.width = win_height * 0.80;
	canvas.height = win_height * 0.80;
	ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('❌ Failed to get canvas context');
	}
}

function drawAlert(winSize: number, alert: string) {
    if (!ctx) return;
    ctx.clearRect(0, 0, winSize, winSize);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, winSize, winSize);
    ctx.font = `40px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(alert, winSize / 2, winSize / 2);
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
		if  (gameOver && e.key === 'Escape') {
			gameOver = false;
			started = false;
			if (socket && socket.connected) {
    	       socket.disconnect();
    	   }
			navigateTo('/');
		}
		else if (gameOver && e.key === 'Enter') {
			gameOver = false;
			started = false;
			if (socket && socket.connected) {
    	       socket.disconnect();
    	   }
			navigateTo('/snake');
		}
	});
	// Resize handling
	window.addEventListener('resize', () => {
		win_width = window.innerWidth;
		win_height = window.innerHeight;
		if (canvas) {
			canvas.width = win_height * 0.80;
			canvas.height = win_height * 0.80;
		}
	});
}

function drawWinner(winner: Snake) {
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.25, canvas.width * 0.8, canvas.height * 0.12);
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width * 0.105, canvas.height * 0.26, canvas.width * 0.79, canvas.height * 0.1);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `${Math.floor(canvas.height * 0.03)}px Arial`;
    ctx.fillText(winner.name + ' wins! (Press Enter to restart)', canvas.width * 0.5, canvas.height * 0.33);
}

function endgameButtons(socket: Socket) {
	const replayBtn = document.getElementById('replayBtn');
    const quitBtn = document.getElementById('quitBtn');
    if (replayBtn) {
        replayBtn.onclick = () => {
			gameOver = false;
			started = false;
			navigateTo('/snake');
        };
    }
    if (quitBtn) {
        quitBtn.onclick = () => {
			gameOver = false;
			started = false;
			if (socket && socket.connected) {
            socket.disconnect();
        }
			navigateTo('/');
        };
    }
}

function displayInfoPlayer(game: Game) {

	const imgP1 = document.getElementById('avatarJoueur1') as HTMLImageElement;
	const nameP1 = document.getElementById('nomJoueur1') as HTMLInputElement;
	nameP1.value = game.p1.name;
	if( game.p1.avatar) {
		imgP1.src = game.p1.avatar;
		if (!game.p1.avatar.startsWith('data:image/')) {
			if (game.p1.avatar.startsWith('iVBOR')) {
				imgP1.src = `data:image/png;base64,${game.p1.avatar}`;
			} else if (game.p1.avatar.startsWith('/9j/')) {
				imgP1.src = `data:image/jpeg;base64,${game.p1.avatar}`;
			} else {
				imgP1.src = `data:image/png;base64,${game.p1.avatar}`;
			}
		}
	}
	const imgP2 = document.getElementById('avatarJoueur2') as HTMLImageElement;
	const nameP2 = document.getElementById('nomJoueur2') as HTMLInputElement;
	nameP2.value = game.p2.name;
	if( game.p2.avatar) {
		imgP2.src = game.p2.avatar;
		if (!game.p2.avatar.startsWith('data:image/')) {
			if (game.p2.avatar.startsWith('iVBOR')) {
				imgP2.src = `data:image/png;base64,${game.p2.avatar}`;
			} else if (game.p2.avatar.startsWith('/9j/')) {
				imgP2.src = `data:image/jpeg;base64,${game.p2.avatar}`;
			} else {
				imgP2.src = `data:image/png;base64,${game.p2.avatar}`;
			}
		}
	}
}

export function snakeGame() {
	const socket = createSnakeSocket();
	socket.on('notLogged', () => {
		navigateTo('/login?/snake');
	});
	initCanvas();
	listenUserInputs(socket);
	socket.on('waiting_snake', (game: Game) => {
		drawAlert(game.winSize, 'Waiting for player ... (1 / 2)');
	})
	socket.on('endGame_snake', (data) => {
		drawAlert(data.winSize, `Game interrupted : ${data.reason}`);
	    drawAlert(data.winsize, 'La partie a été interrompue : ' + data.reason);
	})
	socket.on('draw', (game) => {
		drawAlert(game.winSize, "DRAW")
		if (socket && socket.connected) {
            socket.disconnect();
        }
	});
	socket.on('playerWin_snake', (winner, _game) => {
		if (ctx) {
			gameOver = true;
			started = false;
			//winner announcement
			const btns = document.getElementById('snakeGameEndButtons');
			if (btns) btns.style.display = 'flex';
			endgameButtons(socket);
			if (socket && socket.connected) {
        	    socket.disconnect();
        	}
	    	drawWinner(winner);
			return ;
		}
	});
	// Main game loop (frame update)
	socket.on('gameState_snake', (game: Game) => {
		if (!started) {
			displayInfoPlayer(game);
			started = true;
		}
		drawGame(game);
	});

}
