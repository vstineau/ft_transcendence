// let canvas = document.getElementById('tournamentCanvas') as HTMLCanvasElement;
// let ctx = canvas.getContext('2d');

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let form: HTMLFormElement;
let tournament: Tournament;

// let win_width = window.innerWidth;
// let win_height = window.innerHeight;
// let gameWidth = win_width * 0.8;
// let gameHeight = win_height * 0.8;

import { Game, PlayerTournament, Tournament } from '../types/pongTypes';
// import { Matches } from 'class-validator';

let names: string[] = [];
let bracket: boolean = false;

// let players: PlayerTournament[] = [];
// let matchs: Game[] = [];
//                            1 2 3 4 5 6 7 8
//                             2   4   5   8
//                               2   4   5
//                                 2   4
//                                   4
//
//
// let leaderboard: {

// }
// function shuffle(array: PlayerTournament[]) {
// 	for (let i = array.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[array[i], array[j]] = [array[j], array[i]];
// 	}
// 	return array;
// }

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
	form.append(canvas);
	// updateInfos();
}

function getPlayersName(nb: number) {
	const container = document.createElement('div'); // conteneur global
	container.id = ''
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
	submitNames(container);
	return container;
}

// function drawBrackets(matchs: Game[], currentMatch: number, splitW: number, splitH: number) {
// 	let ratioW = splitW;
// 	let ratioH = splitH;
// 	const px = (canvas.height * canvas.width) / 50000;
// 	if (!ctx) return;
// 	for (let i = 0; i < matchs.length; i++) {
// 		ctx.strokeStyle = 'white';
// 		ctx.lineWidth = 4; // épaisseur de la bordure
// 		ctx.fillStyle = 'black';
// 		if (i === currentMatch) {
// 			ctx.strokeStyle = 'yellow';
// 			ctx.lineWidth = 8; // épaisseur de la bordure
// 		}
// 		ctx.fillRect(ratioW * 0.9, ratioH * 1, splitW * 0.9, splitH * 0.9);
// 		ctx.strokeRect(ratioW * 0.9, ratioH * 1, splitW * 0.9, splitH * 0.9);
// 		ctx.fillStyle = 'white';
// 		// ctx.
// 		// 3. Dessiner une ligne
// 		//   ctx.beginPath();            // Commencer un nouveau chemin
// 		//   ctx.moveTo(50, 50);         // Point de départ (x=50, y=50)
// 		//   ctx.lineTo(300, 200);       // Point d'arrivée (x=300, y=200)
// 		//   ctx.strokeStyle = 'blue';   // Couleur de la ligne
// 		//   ctx.lineWidth = 2;          // Épaisseur de la ligne
// 		//   ctx.stroke();               // Dessiner le chemin
// 		ctx.textAlign = 'center';
// 		ctx.font = `${px}px Arial`;
// 		ctx.fillText(matchs[i].p1.nickName, ratioW + splitW * 0.45, ratioH * 1.2, splitW * 0.8);
// 		ctx.fillText('VS', ratioW + splitW * 0.45, ratioH * 1.5, ratioW * 0.8);
// 		ctx.fillText(matchs[i].p2.nickName, ratioW + splitW * 0.45, ratioH * 1.8, splitW * 0.8);
// 		ratioW += canvas.width / (matchs.length + 2) + splitW * 0.1;
// 		// ratioH += canvas.width / (matchs.length + 2);
// 	}
// }

function drawEmptyBrackets(nbMatchs: number): boolean {
	//
	const splitH = canvas.height / (nbMatchs + 2);
	const splitW = canvas.width / (nbMatchs + 2);
	let ratioW = splitW;
	let ratioH = splitH;
	if (nbMatchs < 1) return true;
	if (!ctx) return false;
	if (nbMatchs === 1) {
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 4; // épaisseur de la bordure
		ctx.fillStyle = 'black';
		ctx.fillRect(canvas.width / 2 - (splitW * 1.1) / 2, ratioH * 1.7, splitW * 0.9, splitH * 0.6);
		ctx.strokeRect(canvas.width / 2 - (splitW * 1.1) / 2, ratioH * 1.7, splitW * 0.9, splitH * 0.6);
		return false;
	}
	for (let i = 0; i < nbMatchs; i++) {
		//
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 4; // épaisseur de la bordure
		ctx.fillStyle = 'black';
		// ctx.fillRect(ratioW * 1, ratioH * 1, splitW * 0.9, splitH * 0.9);
		// ctx.strokeRect(ratioW * 1, ratioH * 1, splitW * 0.9, splitH * 0.9);
		ctx.fillRect(ratioW * 0.9, ratioH * 1.4, splitW * 0.8, splitH * 0.8);
		ctx.strokeRect(ratioW * 0.9, ratioH * 1.4, splitW * 0.8, splitH * 0.8);
		// ctx.fillText(matchs[i].p1.nickName, splitW + splitW * 0.45, splitH * 1.2, splitW * 0.8);
		// ctx.fillText('VS', splitW + splitW * 0.45, splitH * 1.5, splitW * 0.8);
		ratioW += canvas.width / (nbMatchs + 2) + splitW * 0.5;
	}
	return false;
}

// function ajouterBouton() {
//   const bouton = document.createElement('button');
//   bouton.id = 'monBoutonTemporaire';
//   bouton.textContent = 'Je suis temporaire';
//   document.body.appendChild(bouton);
// }

// Pour le supprimer plus tard :
// TypeScript

function deleteElem(id: string) {
	const elem = document.getElementById(id);
	if (elem) elem.remove();
}

function appendElem(id: string, add: HTMLDivElement) {
	const elem = document.getElementById(id);
	if (elem) elem.appendChild(add);
}

function drawBrackets(matchs: Game[]) {
	for (let i = 0; i < matchs.length; i++) {
		const match = document.createElement('div');
		match.className = 'flex justify-between bg-gray-200 p-3 rounded shadow-sm';

		const player1 = document.createElement('div');
		player1.className = 'w-5/12 text-center bg-white p-2 rounded shadow-inner';
		player1.textContent = `Joueur ${i * 2 + 1}`;

		const player2 = document.createElement('div');
		player2.className = 'w-5/12 text-center bg-white p-2 rounded shadow-inner';
		player2.textContent = `Joueur ${i * 2 + 2}`;

		match.appendChild(player1);
		match.appendChild(player2);
		form.appendChild(match);
		form.replaceChildren(match);
	}
	// if (!ctx) return;
	// // 3. Dessiner une ligne
	// ctx.beginPath(); // Commencer un nouveau chemin
	// ctx.moveTo(canvas.width / 2, 0); // Point de départ (x=50, y=50)
	// ctx.lineTo(canvas.width / 2, canvas.height); // Point d'arrivée (x=300, y=200)
	// ctx.strokeStyle = 'gray'; // Couleur de la ligne
	// ctx.lineWidth = 2; // Épaisseur de la ligne
	// ctx.stroke(); // Dessiner le chemin
	// const splitH = canvas.height / (matchs.length + 2);
	// const splitW = canvas.width / (matchs.length + 2);
	// let ratioW = splitW;
	// let ratioH = splitH;
	// let nbMatchs = matchs.length;
	// drawEmptyBrackets(nbMatchs / 4);
	// drawEmptyBrackets(nbMatchs / 2);
	// drawEmptyBrackets(nbMatchs / 8);
	// drawBrackets(matchs, currentMatch, splitW, splitH);
}

function listenInputs() {
	window.addEventListener('keydown', e => {
		if (e.key === 'w' || e.key === 'W') {
		} // key_w = true;
		if (e.key === 's' || e.key === 'S') {
		} //key_s = true;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			// key_up = true;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			// key_down = true;
		}
		if (e.key === 'Enter' && bracket) {
			bracket = false;
			// updateInfos();
			// p1.score = 0;
			// p2.score = 0;
		}
	});

	window.addEventListener('keyup', e => {
		if (e.key === 'w' || e.key === 'W') []; //key_w = false;
		if (e.key === 's' || e.key === 'S') []; //key_s = false;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			// key_up = false;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			// key_down = false;
		}
	});

	window.addEventListener('resize', () => {
		canvas.width = window.innerWidth * 0.8;
		canvas.height = window.innerHeight * 0.8;
		// win_width = canvas.width;
		// win_height = canvas.height;
		// gameWidth = canvas.width;
		// gameHeight = canvas.height;

		// updateInfos();
	});
}
// function drawBrackets(matchs: Game[]) {
// 	switch (matchs.length) {
// 		case 1:
// 			break;
// 		case 2:
// 			break;
// 		case 4:
// 			break;
// 	}
// 	// let split = canvas.width * 0.6 / nbPlayers;
// 	if (!ctx) return;

// 	ctx.clearRect(0, 0, canvas.width, canvas.height);
// 	ctx.fillStyle = 'black';
// 	ctx.fillRect(0, 0, canvas.width, canvas.height);
// 	// for(let i = canvas.width * 0.2; i < canvas.height; i+= split)
// }

function checkSubmited(container: HTMLDivElement) {
	const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
	names = inputs.map(i => i.value.trim());
	console.log(names);
	const firstEmpty = inputs.find(i => i.value.trim().length === 0);
	const duplicate = new Set(names).size !== names.length;
	for (let i = 0; names[i]; i++) {
		if (names[i].length > 15) {
			alert(`${names[i]}: Name too long (15 characters maximum).`);
			return true;
		}
	}
	if (firstEmpty) {
		alert(`You need ${inputs.length} players.`);
		firstEmpty.focus();
		return true;
	}
	if (duplicate) {
		console.log('duplicate');
		alert(`You need ${inputs.length} differents players.`);
		return true;
	}
	return false;
}

function submitNames(container: HTMLDivElement) {
	const button = document.createElement('button');
	button.type = 'button';
	button.id = 'submitNames';
	button.textContent = 'Play !';
	button.className = 'mt-4 rounded-lg bg-gray-800 hover:bg-gray-600 px-4 py-2 text-white';
	container.appendChild(button);
	button.addEventListener('click', () => {
		if(checkSubmited(container)) return;
		// Récupérer les noms et valider
		container.hidden = true;
		// button.hidden = true;
		deleteElem('submitName');
		tournament = new Tournament(names);
		// initGame(); que quand la game se lance
		// while(tournament.players.length > 1){
		tournament.fillMatchs();
		drawBrackets(tournament.matchs);

		// }
		// }
		// console.log(players);
	});
}

export function pongTournament() {
	const playerForm = document.getElementById('playersForm') as HTMLFormElement;
	form = document.getElementById('formNb') as HTMLFormElement;
	form.className = 'flex items-center justify-center w-screen h-screen bg-gray-900';
	const nbPlayersSelect = document.getElementById('nbPlayers') as HTMLSelectElement;
	playerForm.addEventListener('submit', e => {
		e.preventDefault();
		const nbPlayers = parseInt(nbPlayersSelect.value, 10);
		if ((nbPlayers < 4 && nbPlayers > 8) || nbPlayers % 2) {
			alert('You need pair number of players');
			return;
		}
		console.log('Nombre de joueurs :', nbPlayers);
		const uiInput = getPlayersName(nbPlayers);
		playerForm.hidden = true;
		form.append(uiInput);
	});
}
