// @ts-ignore
import { Game, pos, Snake } from '../types/snakeTypes';
import { navigateTo } from '../main';

class LocalSnakeGame {
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private game: Game | null = null;
	private gameOver = false;
	private mainLoop: NodeJS.Timeout | undefined;
	private WIN: number;
	private readonly SEG_SIZE = 20;
	private readonly FPS = 20;
	private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
	private resizeHandler: (() => void) | null = null;

	constructor() {
		this.WIN = Math.floor(window.innerHeight * 0.9);
	}

	private randomPos(side: 'left' | 'right', winSize: number): pos {
		if (side === 'left') {
			return {
				x: Math.floor(Math.random() * (winSize / 2 / this.SEG_SIZE)) * this.SEG_SIZE,
				y: Math.floor(Math.random() * (winSize / this.SEG_SIZE)) * this.SEG_SIZE,
			};
		} else {
			return {
				x: Math.floor(Math.random() * (winSize / 2 / this.SEG_SIZE)) * this.SEG_SIZE + winSize / 2,
				y: Math.floor(Math.random() * (winSize / this.SEG_SIZE)) * this.SEG_SIZE,
			};
		}
	}

	private spawnFoods(g: Game): void {
		const hasLeft = g.foods.some(f => f.side === 'left');
		if (!hasLeft) {
			g.foods.push({ pos: this.randomPos('left', g.winSize), side: 'left' });
		}
		const hasRight = g.foods.some(f => f.side === 'right');
		if (!hasRight) {
			g.foods.push({ pos: this.randomPos('right', g.winSize), side: 'right' });
		}
	}

	private eatFood(snake: Snake, g: Game): boolean {
		const head = snake.segments[0];
		const idx = g.foods.findIndex(
			f => Math.abs(f.pos.x - head.x) < this.SEG_SIZE && Math.abs(f.pos.y - head.y) < this.SEG_SIZE
		);
		if (idx !== -1) {
			g.foods.splice(idx, 1);
			this.spawnFoods(g);
			return true;
		}
		return false;
	}

	private wrap(pos: pos, winSize: number): pos {
		let x = pos.x;
		let y = pos.y;
		if (x < 0) x = winSize - this.SEG_SIZE;
		else if (x >= winSize) x = 0;
		if (y < 0) y = winSize - this.SEG_SIZE;
		else if (y >= winSize) y = 0;
		return { x, y };
	}

	private moveSnake(snake: Snake, winSize: number): void {
		snake.dir = snake.pendingDir;
		const head = this.wrap(
			{
				x: snake.segments[0].x + snake.dir.x * this.SEG_SIZE,
				y: snake.segments[0].y + snake.dir.y * this.SEG_SIZE,
			},
			winSize
		);
		snake.segments.unshift(head);
	}

	private areSegmentsColliding(a: pos, b: pos): boolean {
		return Math.abs(a.x - b.x) < this.SEG_SIZE / 2 && Math.abs(a.y - b.y) < this.SEG_SIZE / 2;
	}

	private checkCollision(snake: Snake, other: Snake): 'self' | 'other' | 'head-on' | null {
		const [head, ..._body] = snake.segments;
		const [otherHead, ...otherBody] = other.segments;

		if (otherBody.some(seg => this.areSegmentsColliding(seg, head))) return 'other';
		if (this.areSegmentsColliding(head, otherHead)) return 'head-on';
		return null;
	}

	private resetGame(g: Game): void {
		g.p1.segments = [
			{
				x: Math.floor((g.winSize * 0.25) / this.SEG_SIZE) * this.SEG_SIZE,
				y: Math.floor((g.winSize * 0.5) / this.SEG_SIZE) * this.SEG_SIZE,
			},
		];
		g.p1.dir = { x: 0, y: -1 };
		g.p1.pendingDir = { x: 0, y: -1 };
		g.p2.segments = [
			{
				x: Math.floor((g.winSize * 0.75) / this.SEG_SIZE) * this.SEG_SIZE,
				y: Math.floor((g.winSize * 0.5) / this.SEG_SIZE) * this.SEG_SIZE,
			},
		];
		g.p2.dir = { x: 0, y: 1 };
		g.p2.pendingDir = { x: 0, y: 1 };
		g.foods = [];
		this.spawnFoods(g);
		this.gameOver = false;
	}

	private initGame(): Game {
		const game: Game = {
			p1: {
				name: 'Player 1',
				segments: [
					{
						x: Math.floor((this.WIN * 0.25) / this.SEG_SIZE) * this.SEG_SIZE,
						y: Math.floor((this.WIN * 0.5) / this.SEG_SIZE) * this.SEG_SIZE,
					},
				],
				dir: { x: 0, y: -1 },
				pendingDir: { x: 0, y: -1 },
				color: 'blue',
				id: 'p1',
			},
			p2: {
				name: 'Player 2',
				segments: [
					{
						x: Math.floor((this.WIN * 0.75) / this.SEG_SIZE) * this.SEG_SIZE,
						y: Math.floor((this.WIN * 0.5) / this.SEG_SIZE) * this.SEG_SIZE,
					},
				],
				dir: { x: 0, y: 1 },
				pendingDir: { x: 0, y: 1 },
				color: 'red',
				id: 'p2',
			},
			foods: [],
			winSize: this.WIN,
		};
		this.spawnFoods(game);
		return game;
	}

	private drawAlert(winSize: number, alert: string): void {
		if (!this.ctx) return;
		this.ctx.clearRect(0, 0, winSize, winSize);
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, winSize, winSize);
		this.ctx.font = `40px Arial`;
		this.ctx.fillStyle = 'white';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(alert, winSize / 2, winSize / 2);
	}

	private drawGame(g: Game): void {
		if (!this.ctx || this.gameOver || !this.canvas) return;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, g.winSize, g.winSize);

		for (const food of g.foods) {
			this.ctx.fillStyle = food.side === 'left' ? '#0ff' : '#f0f';
			this.ctx.fillRect(
				Math.max(0, Math.min(food.pos.x, g.winSize - this.SEG_SIZE)),
				Math.max(0, Math.min(food.pos.y, g.winSize - this.SEG_SIZE)),
				this.SEG_SIZE,
				this.SEG_SIZE
			);
		}

		[g.p1, g.p2].forEach(snake => {
			if (!this.ctx) return;
			this.ctx.fillStyle = snake.color;
			for (const seg of snake.segments) {
				this.ctx.fillRect(
					Math.max(0, Math.min(seg.x, g.winSize - this.SEG_SIZE)),
					Math.max(0, Math.min(seg.y, g.winSize - this.SEG_SIZE)),
					this.SEG_SIZE,
					this.SEG_SIZE
				);
			}
		});
	}

	private endgameButtons(): void {
		const replayBtn = document.getElementById('replayBtn');
		const quitBtn = document.getElementById('quitBtn');
		if (replayBtn) {
			replayBtn.onclick = () => {
				navigateTo('/snake/local');
			};
		}
		if (quitBtn) {
			quitBtn.onclick = () => {
				navigateTo('/snake-choice');
			};
		}
	}

	private listenUserInputs(): void {
		this.keydownHandler = (e: KeyboardEvent) => {
			console.log(e.key);
			if (!this.game) return;

			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'D'].includes(e.key)) {
				e.preventDefault();
				e.stopPropagation();
			}
			if ((e.key === 'w' || e.key === 'W') && this.game.p1.dir.y !== 1) this.game.p1.pendingDir = { x: 0, y: -1 };
			else if ((e.key === 's' || e.key === 'S') && this.game.p1.dir.y !== -1) this.game.p1.pendingDir = { x: 0, y: 1 };
			else if ((e.key === 'a' || e.key === 'A') && this.game.p1.dir.x !== 1) this.game.p1.pendingDir = { x: -1, y: 0 };
			else if ((e.key === 'd' || e.key === 'D') && this.game.p1.dir.x !== -1) this.game.p1.pendingDir = { x: 1, y: 0 };
			else if (e.key === 'ArrowUp' && this.game.p2.dir.y !== 1) this.game.p2.pendingDir = { x: 0, y: -1 };
			else if (e.key === 'ArrowDown' && this.game.p2.dir.y !== -1) this.game.p2.pendingDir = { x: 0, y: 1 };
			else if (e.key === 'ArrowLeft' && this.game.p2.dir.x !== 1) this.game.p2.pendingDir = { x: -1, y: 0 };
			else if (e.key === 'ArrowRight' && this.game.p2.dir.x !== -1) this.game.p2.pendingDir = { x: 1, y: 0 };
			else if (this.gameOver && e.key === 'Enter') {
				const btns = document.getElementById('snakeGameEndButtons');
				if (btns) btns.style.display = 'none';
				this.resetGame(this.game);
				this.startMainLoop();
			} else if (this.gameOver && e.key === 'Escape') {
				const btns = document.getElementById('snakeGameEndButtons');
				if (btns) btns.style.display = 'none';
				navigateTo('/');
			}
		};

		this.resizeHandler = () => {
			this.WIN = Math.floor(window.innerHeight * 0.9);
			const W = Math.floor(((window.innerWidth * 0.9) / window.innerWidth) * window.innerHeight);
			if (this.canvas) {
				this.canvas.width = W;
				this.canvas.height = this.WIN;
			}
			if (this.game) {
				this.game.winSize = this.WIN > W ? this.WIN : W;
			}
		};

		if (!this.canvas) return;
		this.canvas.addEventListener('keydown', this.keydownHandler);
		this.canvas.addEventListener('resize', this.resizeHandler);
	}

	private updateGame(): void {
		if (this.gameOver || !this.game) return;
		[this.game.p1, this.game.p2].forEach(snake => {
			this.moveSnake(snake, this.game!.winSize);
		});

		const col1 = this.checkCollision(this.game.p1, this.game.p2);
		const col2 = this.checkCollision(this.game.p2, this.game.p1);

		if (col1 === 'self' || col1 === 'other') {
			this.endGame(this.game.p2);
			return;
		}
		if (col2 === 'self' || col2 === 'other') {
			this.endGame(this.game.p1);
			return;
		}
		if (col1 === 'head-on' || col2 === 'head-on') {
			this.gameOver = true;
			const btns = document.getElementById('snakeGameEndButtons');
			if (btns) btns.style.display = 'flex';
			this.endgameButtons();
			this.drawAlert(this.game.winSize, 'Draw !');
			if (this.mainLoop) clearInterval(this.mainLoop);
			return;
		}
		[this.game.p1, this.game.p2].forEach(snake => {
			if (!this.eatFood(snake, this.game!)) {
				snake.segments.pop();
			}
		});
	}

	private endGame(winner: Snake): void {
		this.gameOver = true;
		const btns = document.getElementById('snakeGameEndButtons');
		if (btns) btns.style.display = 'flex';
		this.endgameButtons();
		this.drawWinner(winner);
		if (this.mainLoop) {
			clearInterval(this.mainLoop);
			this.mainLoop = undefined;
		}
	}

	private drawWinner(winner: Snake): void {
		if (!this.ctx || !this.canvas) return;
		const px = (this.canvas.height * this.canvas.width) / 35000;

		this.ctx.fillStyle = 'gray';
		// Couleur de la bordure
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 4; // épaisseur de la bordure
		this.ctx.fillRect(
			this.canvas.width * 0.25,
			this.canvas.height * 0.25,
			this.canvas.width * 0.5,
			this.canvas.height * 0.12
		);
		this.ctx.strokeRect(
			this.canvas.width * 0.25,
			this.canvas.height * 0.25,
			this.canvas.width * 0.5,
			this.canvas.height * 0.12
		);
		// this.ctx.fillStyle = 'white';
		// this.ctx.fillRect(this.canvas.width * 0.1, this.canvas.height * 0.25, this.canvas.width * 0.8, this.canvas.height * 0.12);
		// this.ctx.fillStyle = 'black';
		// this.ctx.fillRect(this.canvas.width * 0.105, this.canvas.height * 0.26, this.canvas.width * 0.79, this.canvas.height * 0.1);
		this.ctx.fillStyle = 'white';
		this.ctx.textAlign = 'center';
		this.ctx.font = `${px}px Arial`;
		console.log(winner.name);
		this.ctx.fillText(
			winner.name + ' wins!',
			this.canvas.width * 0.5,
			this.canvas.height * 0.32,
			this.canvas.width * 0.4
		);
	}

	private initCanvas(): boolean {
		this.canvas = document.getElementById('localSnakeGameCanvas') as HTMLCanvasElement;
		if (!this.canvas) {
			console.log("❌ Canvas 'localSnakeGameCanvas' not found");
			return false;
		}

		this.canvas.setAttribute('tabindex', '0');
		this.canvas.focus();

		this.WIN = Math.floor(window.innerHeight * 0.9);
		this.canvas.width = this.WIN;
		this.canvas.height = this.WIN;
		this.ctx = this.canvas.getContext('2d');
		if (!this.ctx) {
			console.log('❌ Failed to get canvas context');
			return false;
		}
		return true;
	}

	private startMainLoop(): void {
		if (this.mainLoop) {
			clearInterval(this.mainLoop);
			this.mainLoop = undefined;
		}
		this.mainLoop = setInterval(() => {
			this.updateGame();
			if (this.game) {
				this.drawGame(this.game);
			}
		}, 1000 / this.FPS);
	}

	public start(): void {
		if (!this.initCanvas()) return;
		this.game = this.initGame();
		this.listenUserInputs();
		this.startMainLoop();
		this.drawAlert(this.game.winSize, 'Press Enter to start!');
	}
}

export function localSnakeGame() {
	const game = new LocalSnakeGame();
	game.start();
}
