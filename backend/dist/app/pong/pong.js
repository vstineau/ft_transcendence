const WIN_HEIGHT = 720;
const WIN_WIDTH = 1280;
let intervalStarted = false;
function initGame() {
    let game = {
        p1: {
            name: 'p1',
            id: '',
            y: WIN_HEIGHT / 2,
            x: 20,
            height: WIN_HEIGHT / 9,
            length: WIN_WIDTH / 90,
            vy: WIN_HEIGHT / 130,
            score: 0,
            key_up: false,
            key_down: false,
        },
        p2: {
            name: 'p2',
            id: '',
            y: WIN_HEIGHT / 2,
            x: WIN_WIDTH * 0.98,
            height: WIN_HEIGHT / 9,
            length: WIN_WIDTH / 90,
            vy: WIN_HEIGHT / 130,
            score: 0,
            key_up: false,
            key_down: false,
        },
        ball: {
            x: WIN_WIDTH / 2,
            y: WIN_HEIGHT / 2,
            radius: (WIN_HEIGHT * WIN_WIDTH) / 80000,
            vx: (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280),
            vy: (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180),
        },
        win: {
            width: WIN_WIDTH,
            height: WIN_HEIGHT,
        },
        over: false,
    };
    return game;
}
let rooms = [];
let roomcount = 0;
function getRoom() {
    return rooms.find(room => room.playersNb < 2 && !room.locked);
}
function createRoom(socket) {
    let newRoom = {
        name: `room_${roomcount++}`,
        playersNb: 1,
        game: initGame(),
        locked: false,
    };
    getInputs(socket, newRoom.game);
    newRoom.game.p1.id = socket.id;
    rooms.push(newRoom);
    return newRoom;
}
function initRoom(socket) {
    const room = getRoom();
    if (room) {
        socket.join(room.name);
        socket.emit('roomjoined', room.name);
        room.playersNb = 2;
        room.game.p2.id = socket.id;
        room.locked = true;
        getInputs(socket, room.game);
    }
    else {
        const newRoom = createRoom(socket);
        socket.join(newRoom.name);
    }
}
function handleDisconnect(app, socket) {
    void app;
    socket.on('disconnect', () => {
        const room = rooms.find(r => r.game.p1.id === socket.id || r.game.p2.id === socket.id);
        if (room) {
            room.game.over = true;
            room.playersNb--;
            if (room.game.p1.id === socket.id) {
                room.game.p1.id = '';
            }
            else if (room.game.p2.id === socket.id) {
                room.game.p2.id = '';
            }
            if (room.playersNb === 0) {
                rooms = rooms.filter(r => r !== room);
                roomcount--;
            }
            app.io
                .to(room.name)
                .emit('playerWin', room.game.p1.id > room.game.p2.id ? room.game.p1.id : room.game.p2.id, room.game);
        }
        socket.off;
        socket.disconnect;
    });
}
export async function startPongGame(app) {
    app.ready().then(() => {
        app.io.on('connection', (socket) => {
            socket.on('initGame', () => {
                initRoom(socket);
                handleDisconnect(app, socket);
                if (!intervalStarted) {
                    intervalStarted = true;
                    setInterval(() => {
                        for (const room of rooms) {
                            if (room.playersNb === 2 && room.locked) {
                                gameLoop(room.game, app);
                                app.io.to(room.name).emit('gameState', room.game);
                            }
                            else if (!room.locked && room.playersNb > 0 && room.playersNb < 2) {
                                app.io.to(room.name).emit('waiting', room);
                            }
                        }
                    }, 1000 / 60);
                }
            });
        });
    });
}
function getInputs(sock, game) {
    sock.on('keyup', (key, id) => {
        if (id === game.p1.id) {
            if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp')
                game.p1.key_up = false;
            if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown')
                game.p1.key_down = false;
        }
        if (id === game.p2.id) {
            if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp')
                game.p2.key_up = false;
            if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown')
                game.p2.key_down = false;
        }
    });
    sock.on('keydown', (key, id) => {
        if (id === game.p1.id) {
            if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp')
                game.p1.key_up = true;
            if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown')
                game.p1.key_down = true;
        }
        if (id === game.p2.id) {
            if (key.key === 'w' || key.key === 'W' || key.key === 'ArrowUp')
                game.p2.key_up = true;
            if (key.key === 's' || key.key === 'S' || key.key === 'ArrowDown')
                game.p2.key_down = true;
        }
    });
    sock.on('keypress', (key) => {
        if (key.key === ' ') {
            resetGame(game);
        }
    });
}
function movePlayer(game) {
    if (game.p1.key_up === true && game.p1.y - game.p1.vy >= -10) {
        game.p1.y -= game.p1.vy;
    }
    if (game.p1.key_down === true && game.p1.y + game.p1.vy <= WIN_HEIGHT - game.p1.height) {
        game.p1.y += game.p1.vy;
    }
    if (game.p2.key_up === true && game.p2.y - game.p2.vy >= -10) {
        game.p2.y -= game.p2.vy;
    }
    if (game.p2.key_down === true && game.p2.y + game.p2.vy <= WIN_HEIGHT - game.p2.height) {
        game.p2.y += game.p2.vy;
    }
}
function checkWin(game, app) {
    if (game.p1.score === 3 || game.p2.score === 3) {
        game.ball.vx = 0;
        game.ball.vy = 0;
        game.ball.x = WIN_WIDTH / 2;
        game.ball.y = WIN_HEIGHT / 2;
        const room = rooms.find(r => r.game.p1.id === game.p1.id || r.game.p2.id === game.p2.id);
        if (room) {
            app.io.to(room.name).emit('playerWin', game.p1.score > game.p2.score ? game.p1.id : game.p2.id, game);
            rooms = rooms.filter(r => r !== room);
            roomcount--;
        }
    }
}
function handlePaddleCollisionP1(game) {
    const collision = game.ball.x > game.p1.x &&
        game.ball.x < game.p1.x + game.p1.length &&
        game.ball.y + game.ball.radius > game.p1.y &&
        game.ball.y - game.ball.radius < game.p1.y + game.p1.height;
    if (collision) {
        game.ball.vx = -game.ball.vx;
        const impactPoint = (game.ball.y - (game.p1.y + game.p1.height / 2)) / (game.p1.height / 2);
        game.ball.vy += impactPoint * 3;
        if (Math.abs(game.ball.vx) < 40)
            game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
    }
}
function handlePaddleCollisionP2(game) {
    const collision = game.ball.x + game.ball.radius > game.p2.x &&
        game.ball.x - game.ball.radius < game.p2.x + game.p2.length &&
        game.ball.y + game.ball.radius > game.p2.y &&
        game.ball.y - game.ball.radius < game.p2.y + game.p2.height;
    if (collision) {
        game.ball.vx = -game.ball.vx;
        const impactPoint = (game.ball.y - (game.p2.y + game.p2.height / 2)) / (game.p2.height / 2);
        game.ball.vy += impactPoint * 3;
        if (Math.abs(game.ball.vx) < 40)
            game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
    }
}
function gameLoop(game, app) {
    movePlayer(game);
    checkWin(game, app);
    game.ball.x += game.ball.vx;
    game.ball.y += game.ball.vy;
    if (game.ball.y <= 0 || game.ball.y >= WIN_HEIGHT - game.ball.radius) {
        game.ball.vy = -game.ball.vy;
    }
    handlePaddleCollisionP1(game);
    handlePaddleCollisionP2(game);
    if (game.ball.x < 0) {
        game.p2.score += 1;
        resetBall(game);
    }
    if (game.ball.x > WIN_WIDTH) {
        game.p1.score += 1;
        resetBall(game);
    }
}
function resetGame(game) {
    resetBall(game);
    game.p1.score = 0;
    game.p2.score = 0;
}
function resetBall(game) {
    game.p1.y = WIN_HEIGHT / 2;
    game.p2.y = WIN_HEIGHT / 2;
    game.ball.x = WIN_WIDTH / 2;
    game.ball.y = WIN_HEIGHT / 2;
    game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (WIN_WIDTH / 280);
    game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (WIN_HEIGHT / 180);
}
//# sourceMappingURL=pong.js.map