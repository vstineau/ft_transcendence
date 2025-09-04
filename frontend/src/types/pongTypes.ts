// import { initPlayer } from '../pong/tournament';
// import { initGame } from '../../../backend/app/snake/snake';
// import { playerEntrance } from '../../../backend/app/pong/tournament';

export interface Game {
	p1: Player | PlayerTournament;
	p2: Player | PlayerTournament;
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
	matchs: Game[] = [];
	leaderBoard: PlayerTournament[] = [];
	rounds: Round; // pk pas?

	// canvas: HTMLCanvasElement | null = null;
	// ctx: CanvasRenderingContext2D | null = null;
	// form: HTMLFormElement | null = null;

	win_width: number = window.innerWidth;
	win_height: number = window.innerHeight;
	gameWidth: number = this.win_width * 0.8;
	gameHeight: number = this.win_height * 0.8;

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
			y: this.gameHeight / 2,
			x: 20,
			height: this.gameHeight / 9,
			length: this.gameWidth / 90,
			vy: this.gameHeight / 130,
			score: 0,
			key_up: false,
			key_down: false,
			totalScore: 0,
			eliminated: false,
		};
		return player;
	}

	//     private getPlayersName(nb: number) {
	// 	const container = document.createElement('div'); // conteneur global
	// 	for (let i = 1; i <= nb; i++) {
	// 		const input = document.createElement('input');
	// 		input.type = 'text';
	// 		input.name = `player${i}`;
	// 		input.placeholder = `Nom du joueur ${i}`;
	// 		input.required = true;
	// 		input.className =
	// 			'center flex max-w-sm items-center gap-x-4 rounded-xl \
	// 			bg-white p-6 shadow-lg outline outline-black/5 \
	// 			dark:bg-gray-800 dark:hover:bg-gray-600 dark:shadow-none \
	// 			dark:-outline-offset-1 dark:outline-white/10';
	// 		input.style.color = 'white';
	// 		container.appendChild(input);
	// 	}
	// 	submitNamesButton(container);
	// 	return container;
	// }

	// initPage() {
	// 	const playerForm = document.getElementById('playersForm') as HTMLFormElement;
	// 	this.form = document.getElementById('formNb') as HTMLFormElement;
	// 	this.form.className = 'flex items-center justify-center w-screen h-screen bg-gray-900';
	// 	const nbPlayersSelect = document.getElementById('nbPlayers') as HTMLSelectElement;
	// 	playerForm.addEventListener('submit', e => {
	// 		e.preventDefault();
	// 		const nbPlayers = parseInt(nbPlayersSelect.value, 10);
	// 		if ((nbPlayers < 4 && nbPlayers > 8) || nbPlayers % 2) {
	// 			alert('You need pair number of players');
	// 			return;
	// 		}
	// 		console.log('Nombre de joueurs :', nbPlayers);
	// 		const uiInput = getPlayersName(nbPlayers);
	// 		playerForm.hidden = true;
	// 		this.form?.append(uiInput);
	// 	});
	// }
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
		// Remplir chaque game avec deux joueurs successifs
		for (let i = 0; i < round.length; i++) {
			const idx = i * 2;
			round[i].p1 = p[idx];
			round[i].p2 = p[idx + 1];
		}
	}
	fillRound() {
		let qualified: PlayerTournament[] = this.players;
		for (let i = 0; qualified[i]; i++) {
			console.log(qualified[i].nickName);
		}
		if (this.rounds.nb < 1) {
			qualified = qualified.filter(player => !player.eliminated);
		}
		this.fillMatchs(this.rounds.games[this.rounds.nb], qualified);
		// this.rounds.nb++;
	}
	private gameInit(player1: PlayerTournament, player2: PlayerTournament): Game {
		let newGame: Game = {
			p1: player1,
			p2: player2,
			ball: {
				x: this.win_width / 2,
				y: this.win_width / 2,
				radius: (this.win_width * this.win_width) / 80000,
				vx: (Math.random() < 0.5 ? -1 : 1) * (this.win_width / 280),
				vy: (Math.random() < 0.5 ? -1 : 1) * (this.win_width / 180),
			},
			win: {
				width: this.win_width,
				height: this.win_width,
			},
			over: false,
		};
		return newGame;
	}
	eliminatePlayers() {
		this.players = this.players.filter(player => !player.eliminated);
	}
	roundLaunch() {
		for (let match of this.matchs) {
			// display next match (press enter to launch)
			// launch match
			// prepare next match (press enter to launch next match)
		}
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
