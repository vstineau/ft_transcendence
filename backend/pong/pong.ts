//SIZE 1000 X 1000
//
//
//
//
//
class Ball {
	posX: number;
	posY: number;
	speed: number;
	dirX: number;
	dirY: number;

	constructor() {
		this.posX = 500;
		this.posY = 500;
		this.speed = 1;
		this.dirX = 1;
		this.dirY = 1;
	}
};

class PongBar {
	posX: number;
	posY: number;
	speed: number;

	constructor(x: number, y: number) {
		this.posX = x;
		this.posY = y;
		this.speed = 1;
	}
};

class Game {
	ball: Ball;
	leftBar: PongBar;
	rightBar: PongBar;
	leftScore: number;
	rightScore: number;
	endgame: boolean;
	constructor() {
		this.ball = new Ball();
		this.rightBar = new PongBar(0, 500);
		this.leftBar = new PongBar(999, 500);
		this.leftScore = 0;
		this.rightScore = 0;
		this.endgame = false;
	}
};


async function up(bar : PongBar) {
	bar.posY++;
}

async function down(bar : PongBar) {
	bar.posY--;
}

async function launchGame() {
	let game = new Game();

	up(game.leftBar);
	down(game.rightBar);
	console.log(game.ball.posX);
	console.log(game.ball.posY);
	console.log(game.leftBar.posY);
	console.log(game.rightBar.posY);
}

await launchGame();
