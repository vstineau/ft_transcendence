

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
	color: string;
	id: string;
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
};

export interface SnakeGameHistory{
	gamecount?: number;
	type?: string;
	date?: string;
	opponent?: string;
	score?: string;
	win?: string;
	finalLength?: number;
	gameTime?: number;
    opponentLogin?: string;

    opponentStats?: {
        finalLength?: number;
        gameTime?: number;

    } | null;
}

export interface PlayerRanking{
	login: string;
    nickName: string;
    totalWins: number;
    totalGames: number;
    maxSize: number;
    bestTime: number;
    lastGameDate: string;
}

export interface ProfileSnake{
	 user: {
        login: string;
        nickName: string;
        avatar?: string;
    };
    stats: {
        ranking: number;
        maxSize: number;
        averageSize: number;
        eatenApples: number;
        totalGames: number;
        totalWins: number;
    };
}


