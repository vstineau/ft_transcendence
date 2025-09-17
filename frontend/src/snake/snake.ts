// @ts-ignore
import io, { Socket } from 'socket.io-client';
import { Game, Snake } from '../types/snakeTypes';
import { navigateTo } from '../main';


export const SnakeSocketStore = {
	current: null as Socket | null,
};

export const uiSnake = {
	controller: null as AbortController | null,
};

export function abortUIListenersSnake() {
	if (uiSnake.controller) uiSnake.controller.abort();
	uiSnake.controller = null;
}

export function disconnectSocketSnake() {
	//abortUIListenersSnake();
	if (SnakeSocketStore.current) {
		try {
			SnakeSocketStore.current.off();
			SnakeSocketStore.current.removeAllListeners?.();
		} catch {}
		try {
			if (SnakeSocketStore.current.connected) SnakeSocketStore.current.disconnect();
		} catch {}
		SnakeSocketStore.current = null;
	}
}

class SnakeGame {
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private socket: Socket | null = null;
	private win_height: number;
	private gameOver = false;
	private started = false;
	private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
	private resizeHandler: (() => void) | null = null;
	private beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

	constructor() {
		this.win_height = window.innerHeight;
	}

	private getCookie(name: string): string | null {
		return (
			document.cookie
				.split('; ')
				.find(row => row.startsWith(name + '='))
				?.split('=')[1] || null
		);
	}

	private createSnakeSocket(custom?: string[]): Socket {
		// console.log('createsocket');
		const host = window.location.hostname;
		const port = window.location.port;
		const protocol = window.location.protocol;
		const socket = io(`${protocol}//${host}:${port}/snake`);

		socket.on('connect', () => {
			const cookie = this.getCookie('token');
			// console.log(cookie);
			socket.emit('isConnected', cookie, custom);
			socket.on('roomJoined_snake', () => {
				socket.emit('initGame_snake');
			});
		});

		SnakeSocketStore.current = socket;
		return socket;
	}

	private initCanvas(): boolean {
		this.canvas = document.getElementById('SnakeGameCanvas') as HTMLCanvasElement;
		if (!this.canvas) {
			console.log("❌ Canvas 'SnakeGameCanvas' not found");
			return false;
		}
		this.canvas.width = this.win_height * 0.8;
		this.canvas.height = this.win_height * 0.8;
		this.ctx = this.canvas.getContext('2d');
		if (!this.ctx) {
			console.log('❌ Failed to get canvas context');
			return false;
		}
		return true;
	}

	private drawAlert(alert: string): void {
		if (!this.ctx || !this.canvas) return;

		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(this.canvas.width * 0.1, this.canvas.height * 0.25, this.canvas.width * 0.8, this.canvas.height * 0.12);
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(
			this.canvas.width * 0.105,
			this.canvas.height * 0.26,
			this.canvas.width * 0.79,
			this.canvas.height * 0.1
		);
		this.ctx.fillStyle = 'white';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.font = `${Math.floor(this.canvas.height * 0.03)}px Arial`;
		this.ctx.fillText(alert, this.canvas.width * 0.5, this.canvas.height * 0.33);
	}

	private drawGame(game: Game): void {
		if (!this.ctx || this.gameOver || !this.canvas) {
			return;
		}

		const scale = this.canvas.height / game.winSize;
		const size = Math.floor(Math.min(this.canvas.width, this.canvas.height) / game.winSize) * 20;

		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, game.winSize * scale, game.winSize * scale);

		// Draw foods
		for (const food of game.foods) {
			this.ctx.fillStyle = food.side === 'left' ? '#0ff' : '#f0f';
			this.ctx.fillRect(food.pos.x * scale, food.pos.y * scale, size, size);
		}

		// Draw snakes
		[game.p1, game.p2].forEach(snake => {
			if (!this.ctx) return;
			this.ctx.fillStyle = snake.color;
			for (const seg of snake.segments) {
				this.ctx.fillRect(seg.x * scale, seg.y * scale, size, size);
			}
		});
	}

	private listenUserInputs(): void {
		this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
			this.cleanup();
		};

		this.keydownHandler = (e: KeyboardEvent) => {
			if (this.socket) {
				this.socket.emit('keydown_snake', { key: e.key }, this.socket.id);
			}

			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
				e.preventDefault();
			}

			if (this.gameOver && e.key === 'Escape') {
				// console.log('escape');
				this.cleanup();
				navigateTo('/dashboard');
			} 
		//	else if (this.gameOver && e.key === 'Enter') {
		//		console.log('enter');
		//		this.cleanup();
		//		navigateTo('/snake-choice');
		//	}
		//	console.log('pas enter');
		};

		this.resizeHandler = () => {
			this.win_height = window.innerHeight;
			if (this.canvas) {
				this.canvas.width = this.win_height * 0.8;
				this.canvas.height = this.win_height * 0.8;
			}
		};

		window.addEventListener('beforeunload', this.beforeUnloadHandler);
		window.addEventListener('keydown', this.keydownHandler);
		window.addEventListener('resize', this.resizeHandler);
	}

	private drawWinner(winner: Snake): void {
		if (!this.ctx || !this.canvas) return;

		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(this.canvas.width * 0.1, this.canvas.height * 0.25, this.canvas.width * 0.8, this.canvas.height * 0.12);
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(
			this.canvas.width * 0.105,
			this.canvas.height * 0.26,
			this.canvas.width * 0.79,
			this.canvas.height * 0.1
		);
		this.ctx.fillStyle = 'white';
		this.ctx.textAlign = 'center';
		this.ctx.font = `${Math.floor(this.canvas.height * 0.03)}px Arial`;
		this.ctx.fillText(winner.name + ' wins! (Press Enter to restart)', this.canvas.width * 0.5, this.canvas.height * 0.33);
	}

	private endgameButtons(): void {
		//const replayBtn = document.getElementById('replayBtn');
		const quitBtn = document.getElementById('quitBtn');
		//replayBtn?.addEventListener("click", () => {
		//		this.cleanup();
		//		navigateTo('/snake-choice');
		//})

		quitBtn?.addEventListener("click", () => {
				this.cleanup();
				navigateTo('/dashboard');
		})

	}

	private displayInfoPlayer(game: Game): void {
		const imgP1 = document.getElementById('avatarJoueur1') as HTMLImageElement;
		const nameP1 = document.getElementById('nomJoueur1') as HTMLInputElement;
		if (nameP1) nameP1.value = game.p1.name;
		if (imgP1 && game.p1.avatar) {
			imgP1.src = game.p1.avatar;
		}

		const imgP2 = document.getElementById('avatarJoueur2') as HTMLImageElement;
		const nameP2 = document.getElementById('nomJoueur2') as HTMLInputElement;
		if (nameP2) nameP2.value = game.p2.name;
		if (imgP2 && game.p2.avatar) {
			imgP2.src = game.p2.avatar;
		}
	}

	private setupSocketListeners(): void {
		if (!this.socket) return;

		this.socket.on('notLogged', () => {
			navigateTo('/login?/snake');
		});

		this.socket.on('waiting_snake', (game: Game) => {
			this.drawAlert('Waiting for player ... (1 / 2)');
		});

		this.socket.on('endGame_snake', (data: any) => {
			this.drawAlert(`Game interrupted : ${data.reason}`);
		});

		this.socket.on('draw', (game: any) => {
			if (this.ctx) {
				this.gameOver = true;
				this.started = false;
				const btns = document.getElementById('snakeGameEndButtons');
				if (btns) btns.style.display = 'flex';
				this.endgameButtons();
				if (this.socket && this.socket.connected) {
					this.socket.disconnect();
				}
				this.drawAlert('DRAW');
			}
		});

		this.socket.on('playerWin_snake', (winner: any, _game: any) => {
			if (this.ctx) {
				this.gameOver = true;
				this.started = false;
				const btns = document.getElementById('snakeGameEndButtons');
				if (btns) btns.style.display = 'flex';
				this.endgameButtons();
				if (this.socket && this.socket.connected) {
					this.socket.disconnect();
				}
				this.drawWinner(winner);
			}
		});

		this.socket.on('gameState_snake', (game: Game) => {
			if (!this.started) {
				this.displayInfoPlayer(game);
				this.started = true;
			}
			this.drawGame(game);
		});
	}

	private cleanup(): void {
		this.gameOver = false;
		this.started = false;

		if (this.socket && this.socket.connected) {
			this.socket.disconnect();
		}
	}

	public async start(): Promise<void> {
		// console.log('start');
		const url = window.location.href;
		const myUrl = new URL(url);
		const params = new URLSearchParams(myUrl.search);

		const player1 = params.get('player1');
		const player2 = params.get('player2');
		let custom = undefined;
		if (player1 && player2) {
			custom = [player1, player2];
		}

		if (!this.initCanvas()) return;
		// console.log('canva ok');

		this.socket = this.createSnakeSocket(custom);
		// console.log('socket good');
		this.setupSocketListeners();
		this.listenUserInputs();
	}
}

export async function snakeGame() {
	//if (performance.navigation.type === 1) {
	//	console.log('ll');
	//	// 1 = reload
	//	// La page a été actualisée
	//	navigateTo('/snake-choice');
	//	return;
	//}
	// console.log('enter snakeGame');
	const game = new SnakeGame();
	// console.log('snakeGame created');
	await game.start();
}
