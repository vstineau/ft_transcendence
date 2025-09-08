// import { Server, Socket } from 'socket.io';
// import { Game, Player, Room } from '../types/pongTypes.js';
// import { FastifyInstance } from 'fastify';
// import { app } from '../app.js';
// import { JwtPayload } from '../types/userTypes.js';
// import { User } from '../models.js';
// import { initPlayer, startPongGame, getInputs, getRoom, createRoom, launchGame } from './pong.js';

// // let game: Game

// let players: Player[] = [];
// let rooms : Room[] = [];

// export interface TournoiState {
//     round: number;
//     rooms: Room[];
//     finished: boolean;
//     locked: boolean;
//     winner: Player | null;
//     players: Player[];
// }

// export class Tournoi {
//     private players: Player[];
//     private round: number;
//     private rooms: Room[];
//     private finished: boolean;
//     private winner: Player | null;

//     constructor(players: Player[]) {
//         this.players = players;
//         this.round = 0;
//         this.rooms = [];
//         this.finished = false;
//         this.winner = null;
//     }
//     private fillBracket(){
//         for(const player of this.players){
//             // const room = 
//         }
//     }
// }

// async function getPlayerinfos(socket: Socket, cookie: string) {
//     if (cookie) {
//         const payload = app.jwt.verify<JwtPayload>(cookie);
//         const user = await User.findOneBy({ login: payload.login });
//         if (!user) {
//             socket.emit('notLogged');
//             return;
//         }
//         let player = initPlayer(socket, user);
//         players.push(player)
//     } else {
//         socket.emit('notLogged');
//         return;
//     }
// }

// export function playerEntrance(app: FastifyInstance) {
//     app.ready().then(() => {
//         app.io.on('connection', (socket: Socket) => {
//             // handleDisconnect(app, socket);
//             socket.on('playerEntrance', (cookie: string) => {
//                 getPlayerinfos(socket, cookie);
//                 launchGame(rooms);
//             });
//         });
//     });
// }
// // function generateBrackets()
