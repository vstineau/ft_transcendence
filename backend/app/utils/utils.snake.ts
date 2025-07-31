import { pos, Game, Snake} from '../types/snakeTypes.js'
import { Socket } from 'socket.io';
//import { FastifyInstance } from 'fastify';

const WIN = 600;

export function randomPos(side: 'left' | 'right', winSize: number): pos {

	if (side === 'left') {
		return {
			x: Math.floor(Math.random() * (winSize/2)),
			y: Math.floor(Math.random() * (winSize))
		};
	} else {
		return {
			x: Math.floor(Math.random() * (winSize/2)) + winSize / 2,
			y: Math.floor(Math.random() * (winSize))
		};
	}
}


export function spawnFoods(g: Game) {
	g.foods = [
		{pos: randomPos('left', g.winSize), side: 'left'},
		{pos: randomPos('right', g.winSize), side: 'right'}
	]
}

export function wrap(pos: pos, winSize: number): pos {
  return {
    x: (pos.x + winSize ) % winSize,
    y: (pos.y + winSize) % winSize
  };
}

export function moveSnake(snake: Snake, winSize: number) {
  snake.dir = snake.pendingDir;
  const head = wrap({
    x: snake.segments[0].x + snake.dir.x,
    y: snake.segments[0].y + snake.dir.y
  }, winSize);
  snake.segments.unshift(head);
}

export function eatFood(snake: Snake, g: Game): boolean {
  const head = snake.segments[0];
  const idx = g.foods.findIndex(f => f.pos.x === head.x && f.pos.y === head.y);
  if (idx !== -1) {
    g.foods.splice(idx, 1);
    return true;
  }
  return false;
}

export function checkCollision(snake: Snake, other: Snake): boolean {
const [head, ...body] = snake.segments;
  // Self collision
  if (body.some(seg => seg.x === head.x && seg.y === head.y)) return true;
  // Other collision
  if (other.segments.some(seg => seg.x === head.x && seg.y === head.y)) return true;
  return false;
}

export function resetGame(g: Game) {
  g.p1.segments = [{ x: g.winSize * 0.25, y: g.winSize * 0.5 }];
  g.p1.dir = { x: 1, y: 0 };
  g.p1.pendingDir = { x: 1, y: 0 };
  g.p2.segments = [{ x: g.winSize * 0.75, y: g.winSize * 0.5 }];
  g.p2.dir = { x: -1, y: 0 };
  g.p2.pendingDir = { x: -1, y: 0 };
  g.foods = [];
  spawnFoods(g);
}

export function initGame(): Game {
	let game = {
		p1: {
			name: 'player 1',
			segments: [{ x: WIN * 0.25, y: WIN * 0.5 }],
			dir: { x: 1, y: 0},
			pendingDir: { x: 1, y: 0},
			color: "blue",
			key_down: false,
			key_up: false,
			key_left: false,
			key_right: false,
		},
		p2: {
			name: 'player 2',
			segments: [{ x: WIN * 0.75, y: WIN * 0.5 }],
			dir: { x: -1, y: 0},
			pendingDir: { x: -1, y: 0},
			color: "red",
			key_down: false,
			key_up: false,
			key_left: false,
			key_right: false,
		},
		foods: [],
		winSize: WIN
	}
	spawnFoods(game);
	return game;
}

export function getInputs(sock: Socket, game: Game) {
	//sock.on('beforeunload', () => {
	//	// game = initGame();


	//	// sock.disconnect();
	//	startPongGame(app);
	//});
	sock.on('keydown', (key: any) => {
		if (key.key === 'w' || key.key === 'W') game.p1.key_up = true;
		if (key.key === 's' || key.key === 'S') game.p1.key_down = true;
		if (key.key === 'a' || key.key === 'A') game.p1.key_left = true;
		if (key.key === 'd' || key.key === 'D') game.p1.key_right = true;
		if (key.key === 'ArrowUp') game.p2.key_up = true;
		if (key.key === 'ArrowDown') game.p2.key_down = true;
		if (key.key === 'ArrowLeft') game.p2.key_left = true;
		if (key.key === 'ArrowRight') game.p2.key_right = true;
	});
	sock.on('keyup', (key: any) => {
		// console.log(key);
		if (key.key === 'w' || key.key === 'W') game.p1.key_up = false;
		if (key.key === 's' || key.key === 'S') game.p1.key_down = false;
		if (key.key === 'a' || key.key === 'A') game.p1.key_left = false;
		if (key.key === 'd' || key.key === 'D') game.p1.key_right = false;
		if (key.key === 'ArrowUp') game.p2.key_up = false;
		if (key.key === 'ArrowDown') game.p2.key_down = false;
		if (key.key === 'ArrowLeft') game.p2.key_left = false;
		if (key.key === 'ArrowRight') game.p2.key_right = false;
	});
	sock.on('keypress', (key: any) => {
		console.log(key.key);
		if (key.key === ' ') {
			resetGame(game);
		}
	});
}

export function update(g: Game, sock: Socket) {
  [g.p1, g.p2].forEach(snake => {
    moveSnake(snake, g.winSize);
    if (!eatFood(snake, g)) snake.segments.pop();
  });

  if (checkCollision(g.p1, g.p2)) {
	sock.emit('playerWin', g.p1.name);
    resetGame(g);
    return;
  }
  if (checkCollision(g.p2, g.p1)) {
	sock.emit('playerWin', g.p1.name);
    resetGame(g);
    return;
  }
}
