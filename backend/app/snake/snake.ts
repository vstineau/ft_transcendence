
import { pos, Game, Snake} from '../types/snakeTypes.js'
import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';

const WIN = 600;
let intervalStarted = false;

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

  const hasLeft = g.foods.some(f => f.side === 'left');
  if (!hasLeft) {
    g.foods.push({pos: randomPos('left', g.winSize), side: 'left'});
  }
  const hasRight = g.foods.some(f => f.side === 'right');
  if (!hasRight) {
    g.foods.push({pos: randomPos('right', g.winSize), side: 'right'});
  }
}

export function eatFood(snake: Snake, g: Game): boolean {
  const head = snake.segments[0];
  const tolerance = 15; 
  const idx = g.foods.findIndex(f =>
    Math.abs(f.pos.x - head.x) <= tolerance &&
    Math.abs(f.pos.y - head.y) <= tolerance
  );
  if (idx !== -1) {
    g.foods.splice(idx, 1);
    spawnFoods(g);
    return true;
  }
  return false;
}

export function wrap(pos: pos, winSize: number): pos {
  return {
    x: (pos.x + winSize ) % winSize,
    y: (pos.y + winSize) % winSize
  };
}

export function moveSnake(snake: Snake, winSize: number) {
  snake.dir = snake.pendingDir;
  for (let i = 0; i < 5; i++) {
	const head = wrap({
  	  x: snake.segments[0].x + snake.dir.x,
  	  y: snake.segments[0].y + snake.dir.y
  	}, winSize);
  	snake.segments.unshift(head);
  }
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
  g.p1.dir = { x: 0, y: 1 };
  g.p1.pendingDir = { x: 0, y: 1 };
  g.p2.segments = [{ x: g.winSize * 0.75, y: g.winSize * 0.5 }];
  g.p2.dir = { x: 0, y: -1 };
  g.p2.pendingDir = { x: 0, y: -1 };
  g.foods = [];
  spawnFoods(g);
}

export function initGame(): Game {
	let game = {
		p1: {
			name: 'player 1',
			segments: [{ x: WIN * 0.25, y: WIN * 0.5 }],
			dir: { x: 0, y: 1},
			pendingDir: { x: 0, y: 1},
			color: "blue",
		},
		p2: {
			name: 'player 2',
			segments: [{ x: WIN * 0.75, y: WIN * 0.5 }],
			dir: { x: 0, y: -1},
			pendingDir: { x: 0, y: -1},
			color: "red",
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
	sock.on('keydown_snake', (key: any) => {
		//console.log(key.key);
		if ((key.key === 'w' || key.key === 'W') &&
			(game.p1.pendingDir.x != 0 && game.p1.pendingDir.y != 1))
			game.p1.pendingDir = {x:0, y:-1};
		else if ((key.key === 's' || key.key === 'S' )&& 
				(game.p1.pendingDir.x != 0 && game.p1.pendingDir.y != -1))
				game.p1.pendingDir = {x:0, y:1};
		else if ((key.key === 'a' || key.key === 'A') && 
				(game.p1.pendingDir.x != 1 && game.p1.pendingDir.y != 0))
				game.p1.pendingDir = {x:-1, y:0};
		else if (key.key === 'd' || key.key === 'D' &&  
				(game.p1.pendingDir.x != -1 && game.p1.pendingDir.y != 0))
				game.p1.pendingDir = {x:1, y:0};
		else if (key.key === 'ArrowUp' && (game.p2.pendingDir.x != 0 && game.p2.pendingDir.y != 1))
				game.p2.pendingDir = {x:0, y:-1};
		else if (key.key === 'ArrowDown'&& (game.p2.pendingDir.x != 0 && game.p2.pendingDir.y != -1))
				game.p2.pendingDir = {x:0, y:1};
		else if (key.key === 'ArrowLeft'&& (game.p2.pendingDir.x != 1 && game.p2.pendingDir.y != 0))
				game.p2.pendingDir = {x:-1, y:0};
		else if (key.key === 'ArrowRight'&& (game.p2.pendingDir.x != -1 && game.p2.pendingDir.y != 0))
				game.p2.pendingDir = {x:1, y:0};
	});
}

export function update(g: Game, sock: Socket) {
  [g.p1, g.p2].forEach(snake => {
    moveSnake(snake, g.winSize);
    if (!eatFood(snake, g)) {
		for (let i = 0; i < 5; i++)
			snake.segments.pop();
	}
  }); 

  if (checkCollision(g.p1, g.p2)) {
	sock.emit('playerWin_snake', g.p2 as Snake, g as Game);
    resetGame(g);
    return;
  }
  if (checkCollision(g.p2, g.p1)) {
	sock.emit('playerWin_snake', g.p1 as Snake, g as Game);
    resetGame(g);
    return;
  }
}


export async function startSnakeGame(app: FastifyInstance) {
	let game = initGame();
	app.ready().then(() => {
		console.log('Snake game on');

		resetGame(game);
		app.io.on('connection', (socket: Socket) => {
			console.log('client connected: ', socket.id);
			socket.join('room1');
			getInputs(socket, game);
			socket.on('initGame_snake', () => {
				if (!intervalStarted) {
					intervalStarted = true;
					setInterval(() => {
						update(game, socket);
						app.io.emit('gameState_snake', game);
					}, 1000 / 50);
				}
			});
		});
	});
}
