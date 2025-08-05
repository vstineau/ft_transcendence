import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 30;
const WIN_HEIGHT = 720;
const WIN_WIDTH = 1280;
let intervalStarted = false;
function initGame() {
    let game = {
        p1: {
            name: 'player 1',
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
            name: 'player 2',
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
    };
    return game;
}
export async function startPongGame(app) {
    let game = initGame();
    app.ready().then(() => {
        console.log('Pong backend is ready');
        resetGame(game);
        app.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            getInputs(socket, game, app);
            socket.on('initGame', () => {
                if (!intervalStarted) {
                    intervalStarted = true;
                    setInterval(() => {
                        gameLoop(game, socket);
                        app.io.emit('gameState', game);
                    }, 1000 / 60);
                }
            });
        });
    });
}
function getInputs(sock, game, app) {
    sock.on('beforeunload', () => {
        sock.emit('playerWin', game.p1.score >= game.p2.score ? game.p1 : game.p2, game);
        startPongGame(app);
    });
    sock.on('keydown', (key) => {
        if (key.key === 'w' || key.key === 'W')
            game.p1.key_up = true;
        if (key.key === 's' || key.key === 'S')
            game.p1.key_down = true;
        if (key.key === 'ArrowUp')
            game.p2.key_up = true;
        if (key.key === 'ArrowDown')
            game.p2.key_down = true;
    });
    sock.on('keyup', (key) => {
        if (key.key === 'w' || key.key === 'W')
            game.p1.key_up = false;
        if (key.key === 's' || key.key === 'S')
            game.p1.key_down = false;
        if (key.key === 'ArrowUp')
            game.p2.key_up = false;
        if (key.key === 'ArrowDown')
            game.p2.key_down = false;
    });
    sock.on('keypress', (key) => {
        console.log(key.key);
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
function checkWin(game, socket) {
    if (game.p1.score === 1 || game.p2.score === 1) {
        game.ball.vx = 0;
        game.ball.vy = 0;
        game.ball.x = WIN_WIDTH / 2;
        game.ball.y = WIN_HEIGHT / 2;
        socket.emit('playerWin', game.p1.score > game.p2.score ? game.p1 : game.p2, game);
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
function gameLoop(game, socket) {
    movePlayer(game);
    checkWin(game, socket);
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