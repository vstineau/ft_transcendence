// let canvas = document.getElementById('tournamentCanvas') as HTMLCanvasElement;
// let ctx = canvas.getContext('2d');

let canvas: HTMLCanvasElement = document.createElement('canvas');
let ctx: CanvasRenderingContext2D | null;
let form :HTMLFormElement;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameWidth = win_width * 0.8;
let gameHeight = win_height * 0.8;

import { Player } from '../types/pongTypes';
// import { initPlayer } from '../../../backend/app/pong/pong';

// function

let names: string[] = [];
let players: Player[] = [];

function initGame() {
	// canvas = document.getElementById('localgameCanvas') as HTMLCanvasElement;
	canvas.width = window.innerWidth * 0.8;
	canvas.height = window.innerHeight * 0.8;
	canvas.className = 'rounded-xl shadow-lg border-4 border-gray-800 bg-black';
	if (!canvas) {
		console.error("Canvas 'game' not found");
		return;
	}
	ctx = canvas.getContext('2d');
	// updateInfos();
}

function getPlayersName(nb: number) {
	const container = document.createElement('div'); // conteneur global
	// form = document.getElementById('formNb') as HTMLFormElement;
	// container.className = "mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10";
	for (let i = 1; i <= nb; i++) {
		console.log(`form ${i} created`);
		const input = document.createElement('input');
		input.type = 'text';
		input.name = `player${i}`;
		input.placeholder = `Nom du joueur ${i}`;
		input.required = true;
		input.className =
			'center flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10';
		input.style.color = 'white';
		container.appendChild(input);
	}
	submitNamesButton(container);
	return container;
}

// export function initPlayer(name: string, index: number): Player {
// 	let player: Player = {
// 		nickName: name,
// 		id: '',
// 		y: WIN_HEIGHT / 2,
// 		x: 20,
// 		height: WIN_HEIGHT / 9,
// 		length: WIN_WIDTH / 90,
// 		vy: WIN_HEIGHT / 130,
// 		score: 0,
// 		key_up: false,
// 		key_down: false,
// 		avatar: user.avatar,
// 		login: user.login,
// 	};
// 	return player;
// }

// function displayPools() {
// 	for (const name in names) {
// 		let player: Player = initPlayer()
// 	}
// }

function submitNamesButton(container: HTMLDivElement) {
	const button = document.createElement('button');
	button.type = 'button'; // mettre 'submit' si tu veux soumettre le <form>
	button.textContent = 'Play !'; // IMPORTANT: texte visible du bouton
	button.className = 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white';
	container.appendChild(button);
	button.addEventListener('click', () => {
		// Récupérer les noms et valider
		const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
		names = inputs.map(i => i.value.trim());
		const firstEmpty = inputs.find(i => i.value.trim().length === 0);

		if (firstEmpty) {
			alert('Veuillez renseigner tous les noms de joueurs.');
			firstEmpty.focus();
			return;
		}
		container.hidden = true;
		button.hidden = true;
		initGame();
		form.append(canvas);
		console.log(players);
	});
}

export function tournament() {
	console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
	const playerForm = document.getElementById('playersForm') as HTMLFormElement;
	form = document.getElementById('formNb') as HTMLFormElement;
	form.className = "flex items-center justify-center w-screen h-screen bg-gray-900";
	const nbPlayersSelect = document.getElementById('nbPlayers') as HTMLSelectElement;
	// let nbPlayers;

	playerForm.addEventListener('submit', e => {
		e.preventDefault(); // Empêche l'envoi classique du formulaire
		const nbPlayers = parseInt(nbPlayersSelect.value, 10); // Récupère et convertit la valeur sélectionnée
		// if (nbPlayers < 4 && nbPlayers > 8) return;
		console.log('Nombre de joueurs :', nbPlayers);
		// form.reset;
		const uiInput = getPlayersName(nbPlayers);
		// let button: HTMLDivElement = submitNamesButton(uiInput);
		// uiInput.appendChild(button);
		// playerForm.reset();
		playerForm.hidden = true;
		form.append(uiInput);
		// initGame();
		// form.append(canvas);
	});
}
