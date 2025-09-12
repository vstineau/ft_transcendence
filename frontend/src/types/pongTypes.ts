// import { initPlayer } from '../pong/tournament';
// import { initGame } from '../../../backend/app/pong/pong';
// import { playerEntrance } from '../../../backend/app/pong/tournament';

import { io, Socket } from "socket.io-client";

export interface Game {
	p1: PlayerTournament;
	p2: PlayerTournament;
	ball: Ball;
	win: Window;
	over: boolean;
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
	login: string;
}

export interface PlayerTournament {
	nickName: string;
	y: number;
	x: number;
	height: number;
	length: number;
	vy: number;
	score: number;
	key_up: boolean;
	key_down: boolean;
	totalScore: number;
	eliminated: boolean;
}

interface Round {
	games: Game[][];
	max: number;
	nb: number;
}

export class Tournament {
	players: PlayerTournament[] = [];
	leaderBoard: PlayerTournament[] = [];
	rounds: Round;
	win_width: number = window.innerWidth;
	win_height: number = window.innerHeight;
	private host = window.location.hostname;
	private port = window.location.port;
	private protocol = window.location.protocol;
	socket: Socket = io(`${this.protocol}//${this.host}:${this.port}/chat`);

	constructor(names: string[]) {
		this.rounds = { games: [], max: names.length === 8 ? 2 : 1, nb: 0 };
		for (const name of names) {
			let player: PlayerTournament = this.initPlayer(name);
			this.leaderBoard.push(player);
			this.players.push(player);
		}
		this.shufflePlayers();
		this.initRounds();
	}

	private initPlayer(name: string): PlayerTournament {
		let player: PlayerTournament = {
			nickName: name,
			y: this.win_height / 2,
			x: 20,
			height: this.win_height / 9,
			length: this.win_width / 90,
			vy: this.win_height / 120,
			score: 0,
			key_up: false,
			key_down: false,
			totalScore: 0,
			eliminated: false,
		};
		return player;
	}
	private shufflePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
	}
	private initRounds() {
		let nbgames = this.players.length === 8 ? 4 : 2;
		for (let i = 0; i <= this.rounds.max; i++) {
			let newRound: Game[] = [];
			for (let j = 0; j < nbgames; j++) {
				const newGame = this.gameInit(this.initPlayer('...'), this.initPlayer('...'));
				newRound.push(newGame);
			}
			this.rounds.games.push(newRound);
			nbgames /= 2;
		}
	}
	private fillMatchs(round: Game[], p: PlayerTournament[]) {
		if (!this) return;
		for (let i = 0; i < round.length; i++) {
			const idx = i * 2;
			round[i] = this.gameInit(p[idx], p[idx + 1]);
			round[i].p1.score = 0;
			round[i].p2.score = 0;
		}
	}
	fillRound() {
		if (!this) return;
		let qualified = this.players.filter(player => !player.eliminated);
		this.fillMatchs(this.rounds.games[this.rounds.nb], qualified);
	}
	private gameInit(player1: PlayerTournament, player2: PlayerTournament): Game {
		let newGame: Game = {
			p1: player1,
			p2: player2,
			ball: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: (window.innerWidth * window.innerHeight) / 80000,
				vx: (Math.random() < 0.5 ? -1 : 1) * (window.innerWidth / 280),
				vy: (Math.random() < 0.5 ? -1 : 1) * (window.innerHeight / 180),
			},
			win: {
				width: window.innerWidth, //this.win_width,
				height: window.innerHeight, //this.win_width,
			},
			over: false,
		};
		newGame.p1.x = 20;
		newGame.p2.x = window.innerWidth * 0.98;
		return newGame;
	}
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

export interface PongGameHistory {
	gamecount?: number;
	type?: string;
	date?: string;
	opponent?: string;
	score?: string;
	win?: string;
	finalBallSpeed?: number;
	gameTime?: number;
	opponentLogin?: string;

	opponentStats?: {
		finalBallSpeed?: number;
		gameTime?: number;
	} | null;
}

export interface PongPlayerRanking {
	login: string;
	nickName: string;
	totalWins: number;
	totalGames: number;
	maxSpeed: number;
	bestTime: number;
	lastGameDate: string;
}

export interface ProfilePong {
	user: {
		login: string;
		nickName: string;
		avatar?: string;
	};
	stats: {
		ranking: number;
		maxSpeed: number;
		averageSpeed: number;
		totalGoals: number;
		totalGames: number;
		totalWins: number;
	};
}
