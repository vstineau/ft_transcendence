import { Server, Socket } from 'socket.io';
// import { EventEmitter } from 'events';
import { Game, Player, Room } from '../types/pongTypes.js';
import { FastifyInstance } from 'fastify';
import { app } from '../app.js';
import { JwtPayload } from '../types/userTypes.js';
import { User } from '../models.js';
import { startPongGame } from './pong.js';
// import { Room } from '../types/pongTypes';

// let game: Game

let players: Player[];
let rooms : Room[];

startPongGame(app)
// function generateBrackets()

export interface TournoiState {
    round: number;
    rooms: Room[];
    finished: boolean;
    winner: Player | null;
    players: Player[];
}

export class Tournoi {
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
	private fillBracket(){
		for(const player of this.players){
			const room = 
		}
	}
}