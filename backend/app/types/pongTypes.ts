export interface Game {
	p1: Player;
	p2: Player;
	ball: Ball;
	win: Window;
	over: boolean;
	gameStart?: number;
	started: boolean;
}

export interface Player {
	nickName: string;
	id: string;
	y: number;
	x: number;
	height: number;
	length: number;
	vy: number;
	score: number;
	key_up: boolean;
	key_down: boolean;
	avatar: string | undefined;
	uid: string;
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
	vx: number;
	vy: number;
	finalSpeed: number;
}

export interface Window {
	width: number;
	height: number;
}

export interface Room {
	name: string;
	playersNb: number;
	game: Game;
	locked: boolean;
	winner: Player | null;
	nameSet: boolean;
	private: string[] | null;
}
