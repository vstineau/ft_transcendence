

export interface Game {
    p1: Snake;
    p2: Snake;
	foods: Food[];
    winSize: number;
}

export type pos = { x: number, y: number}

export interface Snake {
    name: string;
	segments: pos[];
	dir: pos;
	pendingDir: pos;
    key_up: boolean;
    key_down: boolean;
    key_left: boolean;
    key_right: boolean;
	color: string;
}

export interface Food {
	pos: pos;
	side: "left" | "right";
}
