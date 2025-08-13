const WIN = 600;
let snakeRooms = [];
let roomcount = 0;
function getRoom() {
    return snakeRooms.find(room => room.playersNb === 1);
}
function initRoom(socket) {
    const room = getRoom();
    if (room) {
        socket.join(room.name);
        room.playersNb = 2;
        room.game.p2.id = socket.id;
        return room;
    }
    else {
        const newRoom = createRoom(socket);
        socket.join(newRoom.name);
        newRoom.playersNb = 1;
        return newRoom;
    }
}
function createRoom(socket) {
    let newRoom = {
        name: `room_${roomcount++}`,
        playersNb: 1,
        game: initGame(),
    };
    newRoom.game.p1.id = socket.id;
    snakeRooms.push(newRoom);
    return newRoom;
}
function handleDisconnect(app, socket) {
    socket.on('disconnect', () => {
        const room = snakeRooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
        if (room) {
            if (room.interval) {
                clearInterval(room.interval);
                room.interval = undefined;
            }
            app.io.to(room.name).emit('endGame_snake', { reason: 'A player disconnected.', winSize: WIN });
            snakeRooms = snakeRooms.filter(r => r !== room);
            roomcount--;
        }
    });
}
export function randomPos(side, winSize) {
    if (side === 'left') {
        return {
            x: Math.floor(Math.random() * (winSize / 2)),
            y: Math.floor(Math.random() * (winSize))
        };
    }
    else {
        return {
            x: Math.floor(Math.random() * (winSize / 2)) + winSize / 2,
            y: Math.floor(Math.random() * (winSize))
        };
    }
}
export function spawnFoods(g) {
    const hasLeft = g.foods.some(f => f.side === 'left');
    if (!hasLeft) {
        g.foods.push({ pos: randomPos('left', g.winSize), side: 'left' });
    }
    const hasRight = g.foods.some(f => f.side === 'right');
    if (!hasRight) {
        g.foods.push({ pos: randomPos('right', g.winSize), side: 'right' });
    }
}
export function eatFood(snake, g) {
    const head = snake.segments[0];
    const tolerance = 20;
    const idx = g.foods.findIndex(f => Math.abs(f.pos.x - head.x) <= tolerance &&
        Math.abs(f.pos.y - head.y) <= tolerance);
    if (idx !== -1) {
        g.foods.splice(idx, 1);
        spawnFoods(g);
        return true;
    }
    return false;
}
export function wrap(pos, winSize) {
    return {
        x: (pos.x + winSize) % winSize,
        y: (pos.y + winSize) % winSize
    };
}
export function moveSnake(snake, winSize) {
    snake.dir = snake.pendingDir;
    for (let i = 0; i < 8; i++) {
        const head = wrap({
            x: snake.segments[0].x + snake.dir.x,
            y: snake.segments[0].y + snake.dir.y
        }, winSize);
        snake.segments.unshift(head);
    }
}
export function checkCollision(snake, other) {
    const [head, ...body] = snake.segments;
    if (body.some(seg => seg.x === head.x && seg.y === head.y))
        return true;
    if (other.segments.some(seg => seg.x === head.x && seg.y === head.y))
        return true;
    return false;
}
export function resetGame(g) {
    g.p1.segments = [{ x: g.winSize * 0.25, y: g.winSize * 0.5 }];
    g.p1.dir = { x: 0, y: 1 };
    g.p1.pendingDir = { x: 0, y: 1 };
    g.p2.segments = [{ x: g.winSize * 0.75, y: g.winSize * 0.5 }];
    g.p2.dir = { x: 0, y: -1 };
    g.p2.pendingDir = { x: 0, y: -1 };
    g.foods = [];
    spawnFoods(g);
}
export function initGame() {
    let game = {
        p1: {
            name: 'player 1',
            segments: [{ x: WIN * 0.25, y: WIN * 0.5 }],
            dir: { x: 0, y: 1 },
            pendingDir: { x: 0, y: 1 },
            color: "blue",
            id: '',
        },
        p2: {
            name: 'player 2',
            segments: [{ x: WIN * 0.75, y: WIN * 0.5 }],
            dir: { x: 0, y: -1 },
            pendingDir: { x: 0, y: -1 },
            color: "red",
            id: '',
        },
        foods: [],
        winSize: WIN
    };
    spawnFoods(game);
    return game;
}
export function getInputs(sock, game) {
    sock.on('keydown_snake', (key) => {
        if (sock.id === game.p1.id) {
            if ((key.key === 'w' || key.key === 'W') && game.p1.pendingDir.y != 1)
                game.p1.pendingDir = { x: 0, y: -1 };
            else if ((key.key === 's' || key.key === 'S') && game.p1.pendingDir.y != -1)
                game.p1.pendingDir = { x: 0, y: 1 };
            else if ((key.key === 'a' || key.key === 'A') && game.p1.pendingDir.x != 1)
                game.p1.pendingDir = { x: -1, y: 0 };
            else if ((key.key === 'd' || key.key === 'D') && game.p1.pendingDir.x != -1)
                game.p1.pendingDir = { x: 1, y: 0 };
            else if (key.key === 'ArrowUp' && game.p1.pendingDir.y != 1)
                game.p1.pendingDir = { x: 0, y: -1 };
            else if (key.key === 'ArrowDown' && game.p1.pendingDir.y != -1)
                game.p1.pendingDir = { x: 0, y: 1 };
            else if (key.key === 'ArrowLeft' && game.p1.pendingDir.x != 1)
                game.p1.pendingDir = { x: -1, y: 0 };
            else if (key.key === 'ArrowRight' && game.p1.pendingDir.x != -1)
                game.p1.pendingDir = { x: 1, y: 0 };
        }
        else if (sock.id === game.p2.id) {
            if ((key.key === 'w' || key.key === 'W') && game.p2.pendingDir.y != 1)
                game.p2.pendingDir = { x: 0, y: -1 };
            else if ((key.key === 's' || key.key === 'S') && game.p2.pendingDir.y != -1)
                game.p2.pendingDir = { x: 0, y: 1 };
            else if ((key.key === 'a' || key.key === 'A') && game.p2.pendingDir.x != 1)
                game.p2.pendingDir = { x: -1, y: 0 };
            else if ((key.key === 'd' || key.key === 'D') && game.p2.pendingDir.x != -1)
                game.p2.pendingDir = { x: 1, y: 0 };
            else if (key.key === 'ArrowUp' && game.p2.pendingDir.y != 1)
                game.p2.pendingDir = { x: 0, y: -1 };
            else if (key.key === 'ArrowDown' && game.p2.pendingDir.y != -1)
                game.p2.pendingDir = { x: 0, y: 1 };
            else if (key.key === 'ArrowLeft' && game.p2.pendingDir.x != 1)
                game.p2.pendingDir = { x: -1, y: 0 };
            else if (key.key === 'ArrowRight' && game.p2.pendingDir.x != -1)
                game.p2.pendingDir = { x: 1, y: 0 };
        }
    });
}
export function update(g, app, roomId) {
    [g.p1, g.p2].forEach(snake => {
        moveSnake(snake, g.winSize);
        if (!eatFood(snake, g))
            for (let i = 0; i < 8; i++)
                snake.segments.pop();
    });
    if (checkCollision(g.p1, g.p2)) {
        app.io.to(roomId).emit('playerWin_snake', g.p2, g);
        return;
    }
    if (checkCollision(g.p2, g.p1)) {
        app.io.to(roomId).emit('playerWin_snake', g.p1, g);
        return;
    }
}
export async function startSnakeGame(app) {
    app.ready().then(() => {
        app.io.on('connection', (socket) => {
            const room = initRoom(socket);
            handleDisconnect(app, socket);
            getInputs(socket, room.game);
            socket.on('initGame_snake', () => {
                const room = snakeRooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
                if (!room)
                    return;
                if (room.interval)
                    return;
                room.interval = setInterval(() => {
                    for (const room of snakeRooms) {
                        if (room.playersNb === 2) {
                            update(room.game, app, room.name);
                            app.io.to(room.name).emit('gameState_snake', room.game);
                        }
                        else {
                            app.io.to(room.name).emit('waiting_snake', room.game);
                        }
                    }
                }, 1000 / 60);
            });
        });
    });
}
//# sourceMappingURL=snake.js.map