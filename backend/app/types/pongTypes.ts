export interface Game {
    p1: Player;
    p2: Player;
    ball: Ball;
    win: Window;
    over: boolean;
	gameStart?: number;
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
};

export interface TournamentState {
    round: number;
    rooms: Room[];
    finished: boolean;
    winner: Player | null;
    players: Player[];
}

export class Tournament {
    private players: Player[];
    private round: number;
    private rooms: Room[];
    private finished: boolean;
    private winner: Player | null;

    constructor(players: Player[]) {
        this.players = players;
        this.round = 0;
        this.rooms = [];
        this.finished = false;
        this.winner = null;
    }

    private shufflePlayers(players: Player[]): Player[] {
        return players
            .map((p) => ({ sort: Math.random(), value: p }))
            .sort((a, b) => a.sort - b.sort)
            .map((p) => p.value);
    }

    private generateRooms(players: Player[]): Room[] {
        const shuffled = this.shufflePlayers(players);
        const rooms: Room[] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                rooms.push({
                    name: `round${this.round}_match${Math.floor(i / 2)}`,
                    playersNb: 2,
                    game: null as any, // à remplir lors du lancement du match
                    locked: false,
                    winner: null,
                });
            } else {
                // Bye : joueur qualifié d'office
                rooms.push({
                    name: `round${this.round}_match${Math.floor(i / 2)}`,
                    playersNb: 1,
                    game: null as any,
                    locked: false,
                    winner: shuffled[i],
                });
            }
        }
        return rooms;
    }

    public start(): void {
        this.round = 1;
        this.rooms = this.generateRooms(this.players);
        this.finished = false;
        this.winner = null;
    }

    public setMatchWinner(roomName: string, winner: Player): void {
        const room = this.rooms.find((r) => r.name === roomName);
        if (room) room.winner = winner;
        if (this.rooms.every((r) => r.winner !== null)) {
            this.advanceToNextRound();
        }
    }

    private advanceToNextRound(): void {
        const winners = this.rooms
            .map((r) => r.winner)
            .filter((p): p is Player => p !== null);
        if (winners.length === 1) {
            this.finished = true;
            this.winner = winners[0];
            return;
        }
        this.round++;
        this.rooms = this.generateRooms(winners);
    }

    public getState(): TournamentState {
        return {
            round: this.round,
            rooms: this.rooms,
            finished: this.finished,
            winner: this.winner,
            players: this.players,
        };
    }
}
