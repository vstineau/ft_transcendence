// let canvas = document.getElementById('tournamentCanvas') as HTMLCanvasElement;
// let ctx = canvas.getContext('2d');

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let form: HTMLFormElement;

let win_width = window.innerWidth;
let win_height = window.innerHeight;
let gameWidth = win_width * 0.8;
let gameHeight = win_height * 0.8;

import { Player } from '../types/pongTypes';

let names: string[] = [];
let players: Player[] = [];

function initGame() {
	canvas = document.createElement('canvas');
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

export function initPlayer(name: string, index: number): Player {
	let player: Player = {
		nickName: name,
		id: index.toString(),
		y: gameHeight / 2,
		x: 20,
		height: gameHeight / 9,
		length: gameWidth / 90,
		vy: gameHeight / 130,
		score: 0,
		key_up: false,
		key_down: false,
		avatar: '',
		login: '',
	};
	return player;
}

function getPlayersName(nb: number) {
	const container = document.createElement('div'); // conteneur global
	for (let i = 1; i <= nb; i++) {
		const input = document.createElement('input');
		input.type = 'text';
		input.name = `player${i}`;
		input.placeholder = `Nom du joueur ${i}`;
		input.required = true;
		input.className =
			'center flex max-w-sm items-center gap-x-4 rounded-xl \
			bg-white p-6 shadow-lg outline outline-black/5 \
			dark:bg-gray-800 dark:hover:bg-gray-600 dark:shadow-none \
			dark:-outline-offset-1 dark:outline-white/10';
		input.style.color = 'white';
		container.appendChild(input);
	}
	submitNamesButton(container);
	return container;
}

// function displayPools() {
// 	for (const name in names) {
// 		let player: Player = initPlayer()
// 	}
// }

function submitNamesButton(container: HTMLDivElement) {
	const button = document.createElement('button');
	button.type = 'button'; // mettre 'submit' si tu veux soumettre le <form>
	button.textContent = 'Play !'; // IMPORTANT: texte visible du bouton
	button.className = 'mt-4 rounded-lg bg-gray-800 hover:bg-gray-600 px-4 py-2 text-white';
	container.appendChild(button);
	button.addEventListener('click', () => {
		// Récupérer les noms et valider
		const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
		names = inputs.map(i => i.value.trim());
		const firstEmpty = inputs.find(i => i.value.trim().length === 0);
		const duplicate = new Set(names).size !== names.length;
		if (firstEmpty) {
			alert(`You need ${inputs.length} players.`);
			firstEmpty.focus();
			return;
		}
		if (duplicate) {
			console.log('duplicate');
			alert(`You need ${inputs.length} differents players.`);
			return;
		}
		names.forEach((name, index) => {
			let player = initPlayer(name, index);
			players.push(player);
		});
		for(const player of players)
			console.log(player);
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
	form.className = 'flex items-center justify-center w-screen h-screen bg-gray-900';
	const nbPlayersSelect = document.getElementById('nbPlayers') as HTMLSelectElement;
	// let nbPlayers;
	// saveState();
	playerForm.addEventListener('submit', e => {
		e.preventDefault(); // Empêche l'envoi classique du formulaire
		const nbPlayers = parseInt(nbPlayersSelect.value, 10); // Récupère et convertit la valeur sélectionnée
		if ((nbPlayers < 4 && nbPlayers > 8) || nbPlayers % 2) {
			alert('You need pair number of players');
			return;
		}
		console.log('Nombre de joueurs :', nbPlayers);
		// form.reset;
		// const btn = document.createElement('button');
		// btn.textContent = 'Annuler';
		// btn.onclick = undo;
		// document.body.appendChild(btn);
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
