import { Game, pos, Snake } from '../types/snakeTypes';
import { navigateTo } from '../main'

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null = null;
let game: Game;
let gameOver = false;
let mainLoop: NodeJS.Timeout | undefined;

let WIN = Math.floor(window.innerHeight * 0.90);
const SEG_SIZE = 20;
const FPS = 20; 

function randomPos(side: 'left' | 'right', winSize: number): pos {
    if (side === 'left') {
        return {
            x: Math.floor(Math.random() * (winSize / 2 / SEG_SIZE)) * SEG_SIZE,
            y: Math.floor(Math.random() * (winSize / SEG_SIZE)) * SEG_SIZE
        };
    } else {
        return {
            x: Math.floor(Math.random() * (winSize / 2 / SEG_SIZE)) * SEG_SIZE + winSize / 2,
            y: Math.floor(Math.random() * (winSize / SEG_SIZE)) * SEG_SIZE
        };
    }
}

function spawnFoods(g: Game) {
    const hasLeft = g.foods.some(f => f.side === 'left');
    if (!hasLeft) {
        g.foods.push({ pos: randomPos('left', g.winSize), side: 'left' });
    }
    const hasRight = g.foods.some(f => f.side === 'right');
    if (!hasRight) {
        g.foods.push({ pos: randomPos('right', g.winSize), side: 'right' });
    }
}

function eatFood(snake: Snake, g: Game): boolean {
    const head = snake.segments[0];
    const idx = g.foods.findIndex(f =>
        Math.abs(f.pos.x - head.x) < SEG_SIZE &&
        Math.abs(f.pos.y - head.y) < SEG_SIZE
    );
    if (idx !== -1) {
        g.foods.splice(idx, 1);
        spawnFoods(g);
        return true;
    }
    return false;
}

function wrap(pos: pos, winSize: number): pos {
    let x = pos.x;
    let y = pos.y;
    if (x < 0) x = winSize - SEG_SIZE;
    else if (x >= winSize) x = 0;
    if (y < 0) y = winSize - SEG_SIZE;
    else if (y >= winSize) y = 0;
    return { x, y };
}

function moveSnake(snake: Snake, winSize: number) {
    snake.dir = snake.pendingDir;
    const head = wrap({
        x: snake.segments[0].x + snake.dir.x * SEG_SIZE,
        y: snake.segments[0].y + snake.dir.y * SEG_SIZE
    }, winSize);
    snake.segments.unshift(head);
}

function areSegmentsColliding(a: pos, b: pos): boolean {
    return (
        Math.abs(a.x - b.x) < (SEG_SIZE / 2) &&
        Math.abs(a.y - b.y) < (SEG_SIZE / 2)
    );
}

function checkCollision(snake: Snake, other: Snake): "self" | "other" | "head-on" | null {
    const [head, ..._body] = snake.segments;
    const [otherHead, ...otherBody] = other.segments;

    if (otherBody.some(seg => areSegmentsColliding(seg, head))) return "other";
    if (areSegmentsColliding(head, otherHead)) return "head-on";
    return null;
}

function resetGame(g: Game) {
    g.p1.segments = [{ x: Math.floor(g.winSize * 0.25 / SEG_SIZE) * SEG_SIZE, y: Math.floor(g.winSize * 0.5 / SEG_SIZE) * SEG_SIZE }];
    g.p1.dir = { x: 0, y: -1 };
    g.p1.pendingDir = { x: 0, y: -1 };
    g.p2.segments = [{ x: Math.floor(g.winSize * 0.75 / SEG_SIZE) * SEG_SIZE, y: Math.floor(g.winSize * 0.5 / SEG_SIZE) * SEG_SIZE }];
    g.p2.dir = { x: 0, y: 1 };
    g.p2.pendingDir = { x: 0, y: 1 };
    g.foods = [];
    spawnFoods(g);
    gameOver = false;
}

function initGame(): Game {
    let game: Game = {
        p1: {
            name: 'Player 1',
            segments: [{ x: Math.floor(WIN * 0.25 / SEG_SIZE) * SEG_SIZE, y: Math.floor(WIN * 0.5 / SEG_SIZE) * SEG_SIZE }],
            dir: { x: 0, y: -1 },
            pendingDir: { x: 0, y: -1 },
            color: "blue",
            id: 'p1'
        },
        p2: {
            name: 'Player 2',
            segments: [{ x: Math.floor(WIN * 0.75 / SEG_SIZE) * SEG_SIZE, y: Math.floor(WIN * 0.5 / SEG_SIZE) * SEG_SIZE }],
            dir: { x: 0, y: 1 },
            pendingDir: { x: 0, y: 1 },
            color: "red",
            id: 'p2'
        },
        foods: [],
        winSize: WIN
    };
    spawnFoods(game);
    return game;
}

// --- Rendering ---
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

function drawGame(g: Game) {
    if (!ctx || gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, g.winSize, g.winSize);

    for (const food of g.foods) {
        ctx.fillStyle = food.side === 'left' ? "#0ff" : "#f0f";
        ctx.fillRect(
            Math.max(0, Math.min(food.pos.x, g.winSize - SEG_SIZE)),
            Math.max(0, Math.min(food.pos.y, g.winSize - SEG_SIZE)),
            SEG_SIZE, SEG_SIZE
        );
    }

    [g.p1, g.p2].forEach(snake => {
		if (!ctx) return;
        ctx.fillStyle = snake.color;
        for (const seg of snake.segments) {
            ctx.fillRect(
                Math.max(0, Math.min(seg.x, g.winSize - SEG_SIZE)),
                Math.max(0, Math.min(seg.y, g.winSize - SEG_SIZE)),
                SEG_SIZE, SEG_SIZE
            );
        }
    });
}


function endgameButtons() {
	const replayBtn = document.getElementById('replayBtn');
    const quitBtn = document.getElementById('quitBtn');
    if (replayBtn) {
        replayBtn.onclick = () => {
			navigateTo('/snake/local');
        };
    }
    if (quitBtn) {
        quitBtn.onclick = () => {
			navigateTo('/');
        };
    }
}


function listenUserInputs() {
    window.addEventListener('keydown', e => {
		console.log(e.key);
        if ((e.key === 'w' || e.key === 'W') && game.p1.dir.y !== 1) game.p1.pendingDir = { x: 0, y: -1 };
        else if ((e.key === 's' || e.key === 'S') && game.p1.dir.y !== -1) game.p1.pendingDir = { x: 0, y: 1 };
        else if ((e.key === 'a' || e.key === 'A') && game.p1.dir.x !== 1) game.p1.pendingDir = { x: -1, y: 0 };
        else if ((e.key === 'd' || e.key === 'D') && game.p1.dir.x !== -1) game.p1.pendingDir = { x: 1, y: 0 };
        else if (e.key === 'ArrowUp' && game.p2.dir.y !== 1) game.p2.pendingDir = { x: 0, y: -1 };
        else if (e.key === 'ArrowDown' && game.p2.dir.y !== -1) game.p2.pendingDir = { x: 0, y: 1 };
        else if (e.key === 'ArrowLeft' && game.p2.dir.x !== 1) game.p2.pendingDir = { x: -1, y: 0 };
        else if (e.key === 'ArrowRight' && game.p2.dir.x !== -1) game.p2.pendingDir = { x: 1, y: 0 };
        else if (gameOver && e.key === 'Enter') {
			const btns = document.getElementById('snakeGameEndButtons');
			if (btns) btns.style.display = 'none';
            resetGame(game);
            startMainLoop();
        }
        else if (gameOver && e.key === 'Escape') {
			const btns = document.getElementById('snakeGameEndButtons');
			if (btns) btns.style.display = 'none';
            navigateTo('/');
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });

    window.addEventListener('resize', () => {
        WIN = Math.floor(window.innerHeight * 0.90);
        canvas.width = WIN;
        canvas.height = WIN;
        if (game) {
            game.winSize = WIN;
        }
    });
}

function updateGame() {
    if (gameOver) return;
    [game.p1, game.p2].forEach(snake => {
        moveSnake(snake, game.winSize);
    });

    const col1 = checkCollision(game.p1, game.p2);
    const col2 = checkCollision(game.p2, game.p1);

    if (col1 === "self" || col1 === "other") {
        endGame(game.p2);
        return;
    }
    if (col2 === "self" || col2 === "other") {
        endGame(game.p1);
        return;
    }
    if (col1 === "head-on" || col2 === "head-on") {
        gameOver = true;
		const btns = document.getElementById('snakeGameEndButtons');
    	if (btns) btns.style.display = 'flex';
		endgameButtons();
        drawAlert(game.winSize, "Draw !");
        if (mainLoop) clearInterval(mainLoop);
        return;
    }
    [game.p1, game.p2].forEach(snake => {
        if (!eatFood(snake, game)) {
            snake.segments.pop();
        }
    });
}

function endGame(winner: Snake) {
    gameOver = true;
	const btns = document.getElementById('snakeGameEndButtons');
    if (btns) btns.style.display = 'flex';
	endgameButtons();
    drawWinner(winner);
    if (mainLoop) {
        clearInterval(mainLoop);
        mainLoop = undefined;
    }
}

function drawWinner(winner: Snake) {
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.25, canvas.width * 0.8, canvas.height * 0.12);
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width * 0.105, canvas.height * 0.26, canvas.width * 0.79, canvas.height * 0.1);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `40px Arial`;
    ctx.fillText(winner.name + ' wins!', canvas.width * 0.5, canvas.height * 0.33);
}

function initCanvas() {
    canvas = document.getElementById('localSnakeGameCanvas') as HTMLCanvasElement;
    if (!canvas) {
		console.error("❌ Canvas 'SnakeGameCanvas' not found");
		return;
    }
    WIN = Math.floor(window.innerHeight * 0.90);
    canvas.width = WIN;
    canvas.height = WIN;
    ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('❌ Failed to get canvas context');
	}
}

function startMainLoop() {
    if (mainLoop) {
        clearInterval(mainLoop);
        mainLoop = undefined;
    }
    mainLoop = setInterval(() => {
        updateGame();
        drawGame(game);
    }, 1000 / FPS);
}

export function localSnakeGame() {
    initCanvas();
    game = initGame();
    listenUserInputs();
    startMainLoop();
    drawAlert(game.winSize, 'Press Enter to start!');
}
