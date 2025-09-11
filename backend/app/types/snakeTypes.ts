
export interface Game {
    p1: Snake;
    p2: Snake;
	foods: Food[];
    winSize: number;
	gameStart?: number;
}

export type pos = { x: number, y: number}

export interface Snake {
    name: string;
	segments: pos[];
	dir: pos;
	pendingDir: pos;
	color: string;
	id: string;
	uid: string;
	avatar?: string;
}

export interface Food {
	pos: pos;
	side: "left" | "right";
}

export type Room = {
    name: string;
    playersNb: number;
    game: Game;
	interval?: NodeJS.Timeout;
	custom?: boolean;
};
