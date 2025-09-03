import { pos, Game, Snake , Room} from '../types/snakeTypes.js';
import { app } from '../app.js'
import { JwtPayload, UserHistory } from '../types/userTypes.js'
import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { User, History} from '../models.js'
//import { v4 as uuidv4 } from "uuid";

const WIN = 600;
const SEG_SIZE = 10;
const FPS = 30;
let snakeRooms: Room[] = [];
let roomcount = 0;

function getRoom() {
    return snakeRooms.find(room => room.playersNb === 1);
}

function isInvited(loginP1: string, loginP2: string, friend: string[2]): boolean {
	if (loginP1 !== friend[0] || loginP1 !== friend[1])	
		return false;
	if (loginP2 !== friend[0] || loginP2 !== friend[1])	
		return false;
	return true;
}

function initRoom(socket: Socket, user: User, friend?: string[2]) {
    const room = getRoom();
    if (room && user.login != room.game.p1.login) {
		if (!friend) {
			socket.join(room.name);
        	room.playersNb = 2;
        	room.game.p2.id = socket.id;
			room.game.p2.name = user.nickName;
			room.game.p2.login = user.login;
			room.game.p2.avatar = user.avatar;
			return room;
		}
		else if (friend && isInvited(room.game.p1.login, user.login, friend)) {
			socket.join(room.name);
        	room.playersNb = 2;
        	room.game.p2.id = socket.id;
			room.game.p2.name = user.nickName;
			room.game.p2.login = user.login;
			room.game.p2.avatar = user.avatar;
			return room;
		}
		else {
			const newRoom = createRoom(socket, user);
        	socket.join(newRoom.name);
			newRoom.playersNb = 1;
			return newRoom;
		}
    } else {
        const newRoom = createRoom(socket, user);
        socket.join(newRoom.name);
		newRoom.playersNb = 1;
		return newRoom;
	}
}

function createRoom(socket: Socket, user: User): Room {
    let newRoom: Room = {
        name: `room_${roomcount++}`,
        playersNb: 1,
        game: initGame(user),
    };
    newRoom.game.p1.id = socket.id;
    snakeRooms.push(newRoom);
    return newRoom;
}

function handleDisconnect(app: FastifyInstance, socket: Socket) {
    socket.on('disconnect', () => {
        const room = snakeRooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
        if (room) {
            if (room.interval) {
                clearInterval(room.interval);
                room.interval = undefined;
            }
            app.io.of('/snake').to(room.name).emit('endGame_snake', { reason: 'A player disconnected.', winSize: WIN });

            // Remove room from list
            snakeRooms = snakeRooms.filter(r => r !== room);
        }
    });
}

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
  const tolerance = 20; 
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

function checkCollision(snake: Snake, other: Snake): "other" | "head-on" | null {
    const [head, ..._body] = snake.segments;
    const [otherHead, ...otherBody] = other.segments;

    if (otherBody.some(seg => areSegmentsColliding(seg, head))) return "other";
    if (areSegmentsColliding(head, otherHead)) return "head-on";
    return null;
}

function initGame(user: User): Game {
    let game: Game = {
        p1: {
            name: user.nickName,
            segments: [{ x: Math.floor(WIN * 0.25 / SEG_SIZE) * SEG_SIZE, y: Math.floor(WIN * 0.5 / SEG_SIZE) * SEG_SIZE }],
            dir: { x: 0, y: -1 },
            pendingDir: { x: 0, y: -1 },
            color: "blue",
            id: 'p1',
			login: user.login,
			avatar: user.avatar,
        },
        p2: {
            name: 'Player 2',
            segments: [{ x: Math.floor(WIN * 0.75 / SEG_SIZE) * SEG_SIZE, y: Math.floor(WIN * 0.5 / SEG_SIZE) * SEG_SIZE }],
            dir: { x: 0, y: 1 },
            pendingDir: { x: 0, y: 1 },
            color: "red",
            id: 'p2',
			login: '',
			avatar: '',
        },
        foods: [],
        winSize: WIN
    };
    spawnFoods(game);
    return game;
}

export function getInputs(sock: Socket, game: Game) {
		sock.on('keydown_snake', (key: any) => {
		if (sock.id === game.p1.id) {
			if ((key.key === 'w' || key.key === 'W') && game.p1.pendingDir.y != 1)
				game.p1.pendingDir = {x:0, y:-1};
			else if ((key.key === 's' || key.key === 'S' )&& game.p1.pendingDir.y != -1)
					game.p1.pendingDir = {x:0, y:1};
			else if ((key.key === 'a' || key.key === 'A') && game.p1.pendingDir.x != 1)
					game.p1.pendingDir = {x:-1, y:0};
			else if ((key.key === 'd' || key.key === 'D') && game.p1.pendingDir.x != -1 )
					game.p1.pendingDir = {x:1, y:0};
			else if (key.key === 'ArrowUp' && game.p1.pendingDir.y != 1)
					game.p1.pendingDir = {x:0, y:-1};
			else if (key.key === 'ArrowDown'&& game.p1.pendingDir.y != -1)
					game.p1.pendingDir = {x:0, y:1};
			else if (key.key === 'ArrowLeft'&& game.p1.pendingDir.x != 1)
					game.p1.pendingDir = {x:-1, y:0};
			else if (key.key === 'ArrowRight'&& game.p1.pendingDir.x != -1)
					game.p1.pendingDir = {x:1, y:0};
		} else if (sock.id === game.p2.id) {
			if ((key.key === 'w' || key.key === 'W') && game.p2.pendingDir.y != 1)
				game.p2.pendingDir = {x:0, y:-1};
			else if ((key.key === 's' || key.key === 'S' )&& game.p2.pendingDir.y != -1)
					game.p2.pendingDir = {x:0, y:1};
			else if ((key.key === 'a' || key.key === 'A') && game.p2.pendingDir.x != 1)
					game.p2.pendingDir = {x:-1, y:0};
			else if ((key.key === 'd' || key.key === 'D') && game.p2.pendingDir.x != -1 )
					game.p2.pendingDir = {x:1, y:0};
			else if (key.key === 'ArrowUp' && game.p2.pendingDir.y != 1)
					game.p2.pendingDir = {x:0, y:-1};
			else if (key.key === 'ArrowDown'&& game.p2.pendingDir.y != -1)
					game.p2.pendingDir = {x:0, y:1};
			else if (key.key === 'ArrowLeft'&& game.p2.pendingDir.x != 1)
					game.p2.pendingDir = {x:-1, y:0};
			else if (key.key === 'ArrowRight'&& game.p2.pendingDir.x != -1)
					game.p2.pendingDir = {x:1, y:0};
		}
	});
}

async function saveDataInHistory(game: Game, winner: 'P1' | 'P2' | 'DRAW') {

	const user1 = await User.findOneBy({login: game.p1.login});
	if (!user1 ) {
		console.log('cant get user1');
		return ;
	}
	const user2 = await User.findOneBy({login: game.p2.login});
	if (!user2 ) {
		console.log('cant get user2');
		return ;
	}
	const gametime = game.gameStart? Date.now() - game.gameStart: 0;
	const historyp1: UserHistory = {
		type: 'snake',
		date: Date(),
		win: winner === 'P1' ? 'WIN' : 'LOOSE',
		opponent: user2.login,
		score: '',
		finalLength: game.p1.segments.length,
		gameTime: gametime,
	}
	const historyp2: UserHistory = {
		type: 'snake',
		date: Date(),
		win: winner === 'P2' ? 'WIN' : 'LOOSE',
		opponent: user1.login,
		score: '',
		finalLength: game.p2.segments.length,
		gameTime: gametime,
	}
	if (winner === 'DRAW') {
		historyp1.win = 'DRAW';
		historyp2.win = 'DRAW';
	}
	if (!user1.history) user1.history = [];
	user1.history.push(new History(user1, historyp1));
	if (!user2.history) user2.history = [];
	user2.history.push(new History(user2, historyp2));
	user1.save();
	user2.save();
}


export function update(game: Game, app: FastifyInstance, roomId: string) {
    [game.p1, game.p2].forEach(snake => {
        moveSnake(snake, game.winSize);
    });

    const col1 = checkCollision(game.p1, game.p2);
    const col2 = checkCollision(game.p2, game.p1);

    if (col1 === "head-on" || col2 === "head-on" || (col1 === "other" && col2 === "other")) {
        app.io.of('/snake').to(roomId).emit('draw', game);
		saveDataInHistory(game, 'DRAW');
        return;
    }

    if (col1 === "other") {
        app.io.of('/snake').to(roomId).emit('playerWin_snake', game.p2, game);
		saveDataInHistory(game, 'P2');
        return;
    }
    if (col2 === "other") {
        app.io.of('/snake').to(roomId).emit('playerWin_snake', game.p1, game);
		saveDataInHistory(game, 'P1');
        return;
    }
    [game.p1, game.p2].forEach(snake => {
        if (!eatFood(snake, game)) {
            snake.segments.pop();
        }
    });
}


async function getUser(socket: Socket, cookie: string): Promise<User | undefined> {
				
	let user;
	console.log(cookie);
	if (cookie) {
		const payload = app.jwt.verify<JwtPayload>(cookie);
		console.log(payload);
		user = await User.findOneBy({ id: payload.id });
		if (!user) {
			socket.emit('notLogged');
			return undefined;
		}
		return user;
	}
	socket.emit('notLogged');
	return undefined;
}

export async function startSnakeGame(app: FastifyInstance) {
    app.ready().then(() => {
        app.io.of('/snake').on('connection', (socket: Socket) => {
            socket.on('isConnected', async (cookie: string, friend?: string[2]) => {
                const user = await getUser(socket, cookie);
                if (!user) return; // non connecté
                const room = initRoom(socket, user, friend);
                handleDisconnect(app, socket);
                getInputs(socket, room.game);

                socket.on('initGame_snake', () => {
                    const room = snakeRooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
                    if (!room) return;
                    if (room.interval) return;
                    room.interval = setInterval(() => {
                        for (const room of snakeRooms) {
                            if (room.playersNb === 2) { 
								!room.game.gameStart? room.game.gameStart = Date.now(): 0;
                                update(room.game, app, room.name);
                                app.io.of('/snake').to(room.name).emit('gameState_snake', room.game);
                            } else {
                                app.io.of('/snake').to(room.name).emit('waiting_snake', room.game);
                            }
                        }
                    }, 1000 / FPS);
                });
            });
        });
    });
}
