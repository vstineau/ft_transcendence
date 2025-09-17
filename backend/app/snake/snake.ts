import { pos, Game, Snake , Room} from '../types/snakeTypes.js';
import { app } from '../app.js'
import { JwtPayload, UserHistory } from '../types/userTypes.js'
import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { User, History} from '../models.js'

const WIN = 600;
const SEG_SIZE = 10;
const FPS = 30;
let snakeRooms: Room[] = [];
let roomcount = 0;

function getRoom(friend?: string []) {
	if (friend) {
		return snakeRooms.find(room => room.playersNb === 1 && (room.game.p1.uid === friend[0] || room.game.p1.uid === friend[1]));
	}
    return snakeRooms.find(room => room.playersNb === 1 && room.custom === false);
}

function isInvited(uidP1: string, uidP2: string, friend: string[]): boolean {
	if (uidP1 !== friend[0] && uidP1 !== friend[1])	
		return false;
	if (uidP2 !== friend[0] && uidP2 !== friend[1])	
		return false;
	return true;
}

function initRoom(socket: Socket, user: User, friend?: string[]) {
    const room = getRoom(friend);
    if (room && user.id != room.game.p1.uid) {
		if (!friend) {
			socket.join(room.name);
        	room.playersNb = 2;
        	room.game.p2.id = socket.id;
			room.game.p2.name = user.nickName;
			room.game.p2.uid = user.id;
			room.game.p2.avatar = user.avatar;
			return room;
		}
		else if (room && friend && user.id != room.game.p1.uid && isInvited(room.game.p1.uid, user.id, friend)) {
			socket.join(room.name);
        	room.playersNb = 2;
        	room.game.p2.id = socket.id;
			room.game.p2.name = user.nickName;
			room.game.p2.uid = user.id;
			room.game.p2.avatar = user.avatar;
			return room;
		}
		else {
			const newRoom = createRoom(socket, user);
			friend? newRoom.custom = true: newRoom.custom=false;
        	socket.join(newRoom.name);
			newRoom.playersNb = 1;
			return newRoom;
		}
    } else {
        const newRoom = createRoom(socket, user);
		friend? newRoom.custom = true: newRoom.custom=false;
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
			room.playersNb--;
			const sock = app.io.of('snake').sockets.get(room.game.p1.id === socket.id ? room.game.p2.id : room.game.p1.id) as Socket;
			if (sock) {
				sock.emit('playerWin_snake', room.game.p1.id === socket.id ? room.game.p2 : room.game.p1, room.game);
				sock.leave(room.name);
			}
			if (socket) {
				socket.leave(room.name);
			}
            snakeRooms = snakeRooms.filter(r => r !== room);
			if (socket) {
				socket.off;
				socket.disconnect;
			}
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
			uid: user.id,
			avatar: user.avatar,
        },
        p2: {
            name: 'Player 2',
            segments: [{ x: Math.floor(WIN * 0.75 / SEG_SIZE) * SEG_SIZE, y: Math.floor(WIN * 0.5 / SEG_SIZE) * SEG_SIZE }],
            dir: { x: 0, y: 1 },
            pendingDir: { x: 0, y: 1 },
            color: "red",
            id: 'p2',
			uid: '',
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

	const user1 = await User.findOneBy({id: game.p1.uid});
    if (!user1) {
        // console.log('cant get user1');
        return;
    }
    const user2 = await User.findOneBy({id: game.p2.uid});
    if (!user2) {
        // console.log('cant get user2');
        return;
    }

    const gametime = game.gameStart ? Date.now() - game.gameStart : 0;

    const historyp1: UserHistory = {
        type: 'snake',
        date: new Date().toISOString(),
        win: winner === 'P1' ? 'WIN' : winner === 'P2' ? 'LOOSE' : 'DRAW',
        opponent: user2.id,
        score: '',
        finalLength: game.p1.segments.length,
        finalBallSpeed: 0,
        gameTime: gametime,
    }

    const historyp2: UserHistory = {
        type: 'snake',
        date: new Date().toISOString(),
        win: winner === 'P2' ? 'WIN' : winner === 'P1' ? 'LOOSE' : 'DRAW',
        opponent: user1.id,
        score: '',
        finalLength: game.p2.segments.length,
        finalBallSpeed: 0,
        gameTime: gametime,
    }

    const historyEntry1 = new History(user1, historyp1);
    const historyEntry2 = new History(user2, historyp2);

    await historyEntry1.save(); 
    await historyEntry2.save();

    // console.log('History saved for both players');
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
	if (cookie) {
		const payload = app.jwt.verify<JwtPayload>(cookie);
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
    app.io.of('/snake').on('connection', (socket: Socket) => {
        socket.on('isConnected', async (cookie: string, friend?: string[]) => {
            const user = await getUser(socket, cookie);
            if (!user) return; // non connecté
            const room = initRoom(socket, user, friend);
            handleDisconnect(app, socket);
				//console.log('HANDLEDISCONNECT');
            getInputs(socket, room.game);
				//console.log('GETINPUT');
            socket.emit('roomJoined_snake', room.name); // eviter la course !
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
}
