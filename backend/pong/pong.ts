//SIZE 1000 X 1000

const io = new Server();

class Pos {
	x:number;
	y:number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	};
};

class Ball {
	pos: Pos;
	speed: number;
	dirX: number;
	dirY: number;

	constructor() {
		this.pos = new Pos(500, 500);
		this.speed = 1;
		this.dirX = 1;
		this.dirY = 1;
	}
};

class PongBar {
	pos: Pos;
	speed: number;

	constructor(x: number, y: number) {
		this.pos = new Pos(x, y);
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
	bar.pos.y++;
}

async function down(bar : PongBar) {
	bar.pos.x--;
}

async function launchGame() {
	let game = new Game();

	up(game.leftBar);
	down(game.rightBar);
	console.log(game.ball.pos.x);
	console.log(game.ball.pos.y);
	console.log(game.leftBar.pos.y);
	console.log(game.rightBar.pos.y);
	while (!game.endgame)
	{

	}
}




await launchGame();
