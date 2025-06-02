//SIZE 1000 X 1000
//import {Server, Socket} from 'socket.io';
//
//const io = new Server();
//
//export class Pos {
//	x:number;
//	y:number;
//	constructor(x: number, y: number) {
//		this.x = x;
//		this.y = y;
//	};
//};
//
//export class Ball {
//	pos: Pos;
//	speed: number;
//	dir: Pos;
//
//	constructor() {
//		this.pos = new Pos(500, 500);
//		this.speed = 1;
//		this.dir = new Pos(1, 1);
//	}
//};
//
//export class PongBar {
//	pos: Pos;
//	speed: number;
//
//	constructor(x: number, y: number) {
//		this.pos = new Pos(x, y);
//		this.speed = 1;
//	}
//};
//
//export class Game {
//	private ball: Ball;
//	private leftBar: PongBar;
//	private rightBar: PongBar;
//	public leftScore: number;
//	public rightScore: number;
//	public endgame: boolean;
//	constructor(/*server: Server*/) {
//		this.ball = new Ball();
//		this.rightBar = new PongBar(0, 500);
//		this.leftBar = new PongBar(999, 500);
//		this.leftScore = 0;
//		this.rightScore = 0;
//		this.endgame = false;
//	}
//};
//
//
//async function up(bar : PongBar) {
//	bar.pos.y++;
//}
//
//async function down(bar : PongBar) {
//	bar.pos.x--;
//}
//
//async function launchGame() {
//	let game = new Game();
//
//	up(game.leftBar);
//	down(game.rightBar);
//	console.log(game.ball.pos.x);
//	console.log(game.ball.pos.y);
//	console.log(game.leftBar.pos.y);
//	console.log(game.rightBar.pos.y);
//	while (!game.endgame)
//	{
//
//	}
//}




//await launchGame();
