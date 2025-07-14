export interface Game {
    p1: Player;
    p2: Player;
    ball: Ball;
    key: Key
}

export interface Player {
    name: string;
    y: number;
    x: number;
    height: number;
    length: number;
    vy: number;
    score: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
}

export interface Key {
    w: boolean;
    s: boolean;
    up: boolean;
    down: boolean;
}
