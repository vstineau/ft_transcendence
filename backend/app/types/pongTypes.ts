export interface Game {
    p1: Player;
    p2: Player;
    ball: Ball;
    win: Window;
    over: boolean;
}

export interface Player {
    name: string;
    id: string;
    y: number;
    x: number;
    height: number;
    length: number;
    vy: number;
    score: number;
    key_up: boolean;
    key_down: boolean;
    avatar: string;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
}

export interface Window {
    width: number;
    height: number;
}