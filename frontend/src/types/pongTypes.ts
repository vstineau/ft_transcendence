// import { initPlayer } from '../pong/tournament';
// import { initGame } from '../../../backend/app/snake/snake';
// import { playerEntrance } from '../../../backend/app/pong/tournament';

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
	qualified: PlayerTournament[] = []; // surement de la merde
	leaderBoard: PlayerTournament[] = [];
	rounds: Round; // pk pas?

	// canvas: HTMLCanvasElement | null = null;
	// ctx: CanvasRenderingContext2D | null = null;
	// form: HTMLFormElement | null = null;

	win_width: number = window.innerWidth;
	win_height: number = window.innerHeight;
	// gameWidth: number = this.win_width * 0.6;
	// gameHeight: number = this.win_height * 0.6;

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
		this.qualified = this.players; // surement de la merde
	}
	private initRounds() {
		let nbgames = this.players.length === 8 ? 4 : 2;
		for (let i = 0; i <= this.rounds.max; i++) {
			let newRound: Game[] = [];
			for (let j = 0; j < nbgames; j++) {
				// console.log(`game ${j + 1} created`);
				const newGame = this.gameInit(this.initPlayer('...'), this.initPlayer('...'));
				newRound.push(newGame);
			}
			// console.log(`round ${i + 1} pushed`);
			this.rounds.games.push(newRound);
			// console.log(`nb games = ${nbgames}`);
			nbgames /= 2;
		}
	}
	private fillMatchs(round: Game[], p: PlayerTournament[]) {
		if (!this) return;
		// Remplir chaque game avec deux joueurs successifs
		for (let i = 0; i < round.length; i++) {
			const idx = i * 2;
			// if (p.length < this.players.length) {
			// 	p[idx].totalScore += 2;
			// 	p[idx + 1].totalScore += 2;
			// }
			// p[idx].totalScore += p[idx].score;
			// p[idx + 1].totalScore += p[idx + 1].score;
			round[i] = this.gameInit(p[idx], p[idx + 1]);
			// round[i].p1 = this.initPlayer(p[idx].nickName);
			// round[i].p2 = this.initPlayer(p[idx + 1].nickName);
			// round[i].p2.x = window.innerWidth * 0.98;
			// round[i].p1.x = 20;
			round[i].p1.score = 0;
			round[i].p2.score = 0;
		}
		// const sorted = this.players.sort((a, b) => b.totalScore - a.totalScore);
		// for (const sort of sorted) {
		// 	console.log(sort.nickName + ' = ' + sort.totalScore);
		// }
	}
	fillRound() {
		if (!this) return;
		// for(const player of this.players){
		// 	player.totalScore += player.score
		// 	player.score = 0;
		// }
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
