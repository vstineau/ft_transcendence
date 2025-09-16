let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let form: HTMLFormElement;
let tournament: Tournament;
let names: string[] = [];
let gameStart = false;

import { io } from 'socket.io-client';
import { navigateTo } from '../main';
import { Game, Tournament } from '../types/pongTypes';
import { getCookie } from './pong';
// import { promises } from 'readline';

// init game canvas with player button and names
export function initGame(game: Game) {
	form.innerHTML = '';
	const container = document.createElement('div');
	container.className = 'flex flex-row items-center justify-center w-full h-full';
	const leftPanel = document.createElement('div');
	leftPanel.className = 'flex flex-col items-end mr-8';
	const p1Name = document.createElement('div');
	p1Name.textContent = game.p1.nickName;
	p1Name.className = 'font-bold text-xl text-white mb-4';
	const p1Keys = document.createElement('div');
	p1Keys.className = 'flex flex-col items-end gap-2';
	const keyW = document.createElement('div');
	keyW.id = 'p1keyup';
	keyW.textContent = 'W';
	keyW.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	const keyS = document.createElement('div');
	keyS.id = 'p1keydown';
	keyS.textContent = 'S';
	keyS.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow text-lg font-mono';
	p1Keys.appendChild(keyW);
	p1Keys.appendChild(keyS);
	leftPanel.appendChild(p1Name);
	leftPanel.appendChild(p1Keys);
	canvas = document.createElement('canvas');
	canvas.width = window.innerWidth * 0.6;
	canvas.height = window.innerHeight * 0.6;
	canvas.className = 'rounded-xl shadow-lg border-4 border-gray-800 bg-black md-4 mx-8';
	ctx = canvas.getContext('2d');
	const rightPanel = document.createElement('div');
	rightPanel.className = 'flex flex-col items-start ml-8';
	const p2Name = document.createElement('div');
	p2Name.textContent = game.p2.nickName;
	p2Name.className = 'font-bold text-xl text-white mb-4';
	const p2Keys = document.createElement('div');
	p2Keys.className = 'flex flex-col items-start gap-2';
	const keyUp = document.createElement('div');
	keyUp.id = 'p2keyup';
	keyUp.textContent = '↑';
	keyUp.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	const keyDown = document.createElement('div');
	keyDown.id = 'p2keydown';
	keyDown.textContent = '↓';
	keyDown.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow text-lg font-mono';
	p2Keys.appendChild(keyUp);
	p2Keys.appendChild(keyDown);
	rightPanel.appendChild(p2Name);
	rightPanel.appendChild(p2Keys);
	container.appendChild(leftPanel);
	container.appendChild(canvas);
	container.appendChild(rightPanel);
	form.appendChild(container);
}

function getPlayersName(nb: number, firstInput:string) {
	// let firstinput = '';
	// const host = window.location.hostname;
	// const port = window.location.port;
	// const protocol = window.location.protocol;
	// let socket = io(`${protocol}//${host}:${port}/tournament`);
	// let cookie = getCookie('token');
	// socket.on('connect', () => {
	// 	socket.emit('getPlayerName', cookie);
	// });
	// socket.on('NameIs', async (name: string) => {
	// 	firstinput = name;
	// });
	// create user inputs to fill players name
	const container = document.createElement('div'); // conteneur global
	container.id = '';
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
			dark:-outline-offset-1 dark:outline-white/10 my-2';
		input.style.color = 'white';
		if (i === 1) input.value = firstInput;
		container.appendChild(input);
	}
	submitNames(container);
	return container;
}

function deleteElem(id: string) {
	const elem = document.getElementById(id);
	if (elem) elem.remove();
}

function nextMatchButton(game: Game): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.id = 'playNextRound';
	button.textContent = `Next Match !`;
	button.className = 'rounded-lg bg-gray-700 hover:bg-gray-500 hover:outline hover:outline-yellow-500 px-4 py-2 text-white';
	return button;
}

export function drawTitle(title: string): HTMLHeadingElement {
	const header = document.createElement('h2');
	header.textContent = title;
	header.className = 'mb-10 text-2xl font-bold text-white';
	return header;
}

// draw brackets for next round matchs
function drawBrackets(matchIdx: number, roundnb: number): HTMLDivElement {
	const matchsContainer = document.createElement('div');
	matchsContainer.className = 'flex flex-col';
	for (let i = 0; i <= tournament.rounds.max; i++) {
		const round = document.createElement('div');
		round.className = 'flex flex-row rounded mb-10 justify-center items-center';
		for (let j = 0; j < tournament.rounds.games[i].length; j++) {
			const match = document.createElement('div');
			match.className = 'flex flex-col border hover:bg-gray-500 items-center bg-gray-600 p-2 rounded shadow-sm mx-4';
			if (j === matchIdx && i === roundnb) {
				match.className += ' animate-bounce outline outline-yellow-500';
				// envoyer la notif sur le chat tournament
				const p1 = tournament.rounds.games[roundnb][matchIdx].p1.nickName;
				const p2 = tournament.rounds.games[roundnb][matchIdx].p2.nickName;
				tournament.socket.emit('nextMatch', p1, p2);
				//-> socket.on("nextMatch", (p1: string, p2: string) => {
				//})
			}

			const player1 = document.createElement('div');
			player1.className =
				'w-40 font-bold text-white text-center break-words bg-gray-400 rounded shadow-inner mb-1 px-2 py-1';
			player1.textContent = `${tournament.rounds.games[i][j].p1.nickName}`;

			const vs = document.createElement('div');
			vs.className = 'text-center mb-1 font-bold';
			vs.textContent = `VS`;

			const player2 = document.createElement('div');
			player2.className = 'w-40 font-bold text-white text-center break-words bg-gray-400 rounded shadow-inner px-2 py-1';
			player2.textContent = `${tournament.rounds.games[i][j].p2.nickName}`;
			if (tournament.rounds.games[i][j].over) {
				match.className += ' brightness-50';
				if (tournament.rounds.games[i][j].p2.eliminated) {
					player1.className += ' outline outline-green-500';
					player1.textContent += ' 🏆';
					player2.className += ' outline outline-red-500';
					player2.textContent += ' ❌';
				} else {
					player2.className += ' outline outline-green-500';
					player2.textContent += ' 🏆';
					player1.className += ' outline outline-red-500';
					player1.textContent += ' ❌';
				}
			}
			match.appendChild(player1);
			match.appendChild(vs);
			match.appendChild(player2);
			round.appendChild(match);
		}
		matchsContainer.appendChild(round);
	}
	form.className = 'flex flex-col items-center';
	return matchsContainer;
}

// update game info when resizing window
function updateInfos(game: Game) {
	game.ball.x = game.win.width / 2 - game.ball.radius / 2;
	game.ball.y = game.win.height / 2 - game.ball.radius / 2;

	game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (game.win.width / 280);
	game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (game.win.height / 180);
	game.ball.radius = (game.win.height * game.win.width) / 80000;
	if (game.ball.radius < 5) game.ball.radius = 5;
	if (game.ball.radius > 30) game.ball.radius = 30;

	game.p1.y = game.win.height / 2 - game.p1.height / 2;
	game.p2.y = game.win.height / 2 - game.p1.height / 2;
	game.p2.x = game.win.width * 0.98;
	game.p1.x = 20;

	game.p1.height = game.win.height / 9;
	game.p1.length = game.win.width / 90;
	game.p1.vy = game.win.height / 120;

	game.p2.height = game.win.height / 9;
	game.p2.length = game.win.width / 90;
	game.p2.vy = game.win.height / 120;
}

let currentGame: Game | null = null;

// key handler for key down (make the buttons shine when pressed)
function handleKeyDown(e: KeyboardEvent) {
	if (!currentGame) return;
	let keyUpP1 = document.getElementById('p1keyup');
	let keyDownP1 = document.getElementById('p1keydown');
	let keyUpP2 = document.getElementById('p2keyup');
	let keyDownP2 = document.getElementById('p2keydown');

	if (e.key === 'w' || e.key === 'W') {
		currentGame.p1.key_up = true;
		if (keyUpP1)
			keyUpP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 's' || e.key === 'S') {
		currentGame.p1.key_down = true;
		if (keyDownP1)
			keyDownP1.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault();
		currentGame.p2.key_up = true;
		if (keyUpP2)
			keyUpP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		currentGame.p2.key_down = true;
		if (keyDownP2)
			keyDownP2.className =
				'bg-gray-500 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono outline outline-yellow-500';
	}
	if (e.key === 'Enter' && currentGame.over) {
		gameStart = false;
	}
}

// key handler for key up
function handleKeyUp(e: KeyboardEvent) {
	if (!currentGame) return;
	let keyUpP1 = document.getElementById('p1keyup');
	let keyDownP1 = document.getElementById('p1keydown');
	let keyUpP2 = document.getElementById('p2keyup');
	let keyDownP2 = document.getElementById('p2keydown');

	if (e.key === 'w' || e.key === 'W') {
		currentGame.p1.key_up = false;
		if (keyUpP1) keyUpP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 's' || e.key === 'S') {
		currentGame.p1.key_down = false;
		if (keyDownP1) keyDownP1.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault();
		currentGame.p2.key_up = false;
		if (keyUpP2) keyUpP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		currentGame.p2.key_down = false;
		if (keyDownP2) keyDownP2.className = 'bg-gray-700 text-white px-4 py-2 rounded-lg shadow mb-2 text-lg font-mono';
	}
}

//listen user inputs to move pads W/S  arrowUp / arrowDown
function listenInputs(game: Game) {
	window.removeEventListener('keydown', handleKeyDown);
	window.removeEventListener('keyup', handleKeyUp);
	currentGame = game;
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
	window.addEventListener('resize', () => {
		canvas.width = window.innerWidth * 0.6;
		canvas.height = window.innerHeight * 0.6;
		updateInfos(game);
	});
}

function areAllAlphanumeric(arr: string[]) {
	return arr.every(str => /^[a-zA-Z0-9]+$/.test(str));
}

// check if player names fill policy
function checkSubmited(container: HTMLDivElement) {
	const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
	names = inputs.map(i => i.value.trim());
	const firstEmpty = inputs.find(i => i.value.trim().length === 0);
	const duplicate = new Set(names).size !== names.length;
	for (let i = 0; names[i]; i++) {
		if (names[i].length > 10) {
			alert(`${names[i]}: Name too long (10 characters maximum).`);
			return true;
		}
	}
	// comment to make tests
	if (firstEmpty) {
		alert(`You need ${inputs.length} players.`);
		firstEmpty.focus();
		return true;
	}
	if (!areAllAlphanumeric(names)) {
		alert(`alpha-num names are required`);
		return true;
	}
	//comment to make tests
	if (duplicate) {
		alert(`You need ${inputs.length} differents players.`);
		return true;
	}
	return false;
}

// shows count down before game starts
export function showCountdown(element: HTMLElement) {
	const container = document.createElement('div');
	container.className = `
		fixed top-0 left-0 w-screen h-screen flex flex-col justify-center items-center
		z-50
	`;
	container.id = 'countDown';
	const label = document.createElement('div');
	label.textContent = 'Game start in';
	label.className = `
		text-4xl font-mono text-white
		rounded-xl px-8 py-6 mb-6
		shadow-lg
	`;
	const number = document.createElement('div');
	number.className = `
		text-8xl font-mono font-bold text-white
		rounded-full px-12 py-4
		shadow-2xl
		transition-opacity duration-500 ease-in-out
		opacity-0
	`;
	container.appendChild(label);
	container.appendChild(number);
	element.appendChild(container);
	const values = ['3', '2', '1'];
	let idx = 0;
	const fadeIn = () => {
		number.textContent = values[idx];
		number.style.opacity = '1';
	};
	const fadeOut = () => {
		number.style.opacity = '0';
	};
	const next = () => {
		if (idx < values.length) {
			fadeIn();
			setTimeout(() => {
				fadeOut();
				idx++;
				setTimeout(next, 300);
			}, 1000);
		} else {
			container.remove();
		}
	};
	next();
}

let currentMatch = 0;
let currentRound = 0;
let mainLoop: NodeJS.Timeout | undefined;

// starts the game and init loop
function startMainLoop(game: Game) {
	if (mainLoop) {
		clearInterval(mainLoop);
		mainLoop = undefined;
	}
	listenInputs(game);
	mainLoop = setInterval(() => {
		if (!gameStart) {
			currentMatch++;
			showNextMatch();
			clearInterval(mainLoop);
			return;
		}
		gameLoop(canvas, tournament.rounds.games[currentRound][currentMatch]);
	}, 1000 / 60);
}

// draw player and ball
function drawGame(game: Game) {
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.lineWidth = 5;
	ctx.fillRect(
		(game.ball.x / game.win.width) * canvas.width,
		(game.ball.y / game.win.height) * canvas.height,
		(game.ball.radius / game.win.width) * canvas.width,
		(game.ball.radius / game.win.height) * canvas.height
	);
	ctx.fillRect(
		(game.p1.x / game.win.width) * canvas.width,
		(game.p1.y / game.win.height) * canvas.height,
		(game.p1.length / game.win.width) * canvas.width,
		(game.p1.height / game.win.height) * canvas.height
	);
	ctx.fillRect(
		(game.p2.x / game.win.width) * canvas.width,
		(game.p2.y / game.win.height) * canvas.height,
		(game.p2.length / game.win.width) * canvas.width,
		(game.p2.height / game.win.height) * canvas.height
	);
	for (let height = 0; height < canvas.height; height += 15) {
		ctx.fillRect(canvas.width / 2 - 2, height, 5, 10);
	}
	const px = (canvas.height * canvas.width) / 35000 > 20 ? (canvas.height * canvas.width) / 35000 : 20;
	ctx.font = `${px}px Arial`;
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.fillText(game.p1.score.toString(), canvas.width * 0.25, canvas.height * 0.07);
	ctx.fillText(game.p2.score.toString(), canvas.width * 0.75, canvas.height * 0.07);
	ctx.restore();
}

function movePlayer(game: Game) {
	if (game.p1.key_up === true && game.p1.y - game.p1.vy >= 1) game.p1.y -= game.p1.vy;
	if (game.p1.key_down === true && game.p1.y + game.p1.vy <= game.win.height - game.p1.height) game.p1.y += game.p1.vy;
	if (game.p2.key_up === true && game.p2.y - game.p2.vy >= 1) game.p2.y -= game.p2.vy;
	if (game.p2.key_down === true && game.p2.y + game.p2.vy <= game.win.height - game.p2.height) game.p2.y += game.p2.vy;
}

// check if on of the players won
function checkWin(game: Game) {
	if ((game.p1.score === 3 || game.p2.score === 3) && ctx) {
		const px = (canvas.height * canvas.width) / 35000;
		game.ball.vx = 0;
		game.ball.vy = 0;
		game.ball.x = game.win.width / 2 - game.ball.radius / 2;
		game.ball.y = game.win.height / 2 - game.ball.radius / 2;
		ctx.fillStyle = 'gray';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 4;
		ctx.fillRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
		ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.12);
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.font = `${px}px Arial`;
		ctx.fillText(
			(game.p1.score > game.p2.score ? game.p1.nickName : game.p2.nickName) + ' wins, press `Enter` to continue',
			canvas.width * 0.5,
			canvas.height * 0.32,
			canvas.width * 0.45
		);
		game.p1.score > game.p2.score ? (game.p2.eliminated = true) : (game.p1.eliminated = true);
		if (!game.over) {
			game.p1.totalScore += game.p1.score;
			game.p2.totalScore += game.p2.score;
			game.p2.eliminated === true ? (game.p1.totalScore += 2) : (game.p2.totalScore += 2);
		}
		game.over = true;
	}
}

//check collision for player one
function handlePaddleCollisionP1(game: Game) {
	const collision =
		game.ball.x > game.p1.x &&
		game.ball.x < game.p1.x + game.p1.length &&
		game.ball.y + game.ball.radius > game.p1.y &&
		game.ball.y - game.ball.radius < game.p1.y + game.p1.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;
		const impactPoint = (game.ball.y - (game.p1.y + game.p1.height / 2)) / (game.p1.height / 2);
		game.ball.vy += impactPoint * 3;
		if (Math.abs(game.ball.vx) < 30) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

//check collision for player two
function handlePaddleCollisionP2(game: Game) {
	const collision =
		game.ball.x + game.ball.radius > game.p2.x &&
		game.ball.x - game.ball.radius < game.p2.x + game.p2.length &&
		game.ball.y + game.ball.radius > game.p2.y &&
		game.ball.y - game.ball.radius < game.p2.y + game.p2.height;

	if (collision) {
		game.ball.vx = -game.ball.vx;
		const impactPoint = (game.ball.y - (game.p2.y + game.p2.height / 2)) / (game.p2.height / 2);
		game.ball.vy += impactPoint * 3;
		if (Math.abs(game.ball.vx) < 30) game.ball.vx += game.ball.vx > 0 ? 1.5 : -1.5;
	}
}

// main game loop
function gameLoop(canvas: HTMLCanvasElement, game: Game) {
	drawGame(game);
	movePlayer(game);
	checkWin(game);

	// ball movement
	game.ball.x += game.ball.vx;
	game.ball.y += game.ball.vy;

	// collision celling
	if (game.ball.y <= 0 || game.ball.y >= game.win.height - game.ball.radius) {
		game.ball.vy = -game.ball.vy;
	}
	handlePaddleCollisionP1(game);
	handlePaddleCollisionP2(game);
	if (game.ball.x < 0) {
		game.p2.score += 1;
		game.ball.x = game.win.width / 2;
		game.ball.y = game.win.height / 2;
		game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (game.win.width / 280);
		game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (game.win.height / 180);
	}
	if (game.ball.x > game.win.width) {
		game.p1.score += 1;
		game.ball.x = game.win.width / 2;
		game.ball.y = game.win.height / 2;
		game.ball.vx = (Math.random() < 0.5 ? -1 : 1) * (game.win.width / 280);
		game.ball.vy = (Math.random() < 0.5 ? -1 : 1) * (game.win.height / 180);
	}
}

// draw score board after the game (different behavior for 1, 2, 3 winners)
function drawScoreBoard() {
	const sorted = [...tournament.players].sort((a, b) => b.totalScore - a.totalScore);
	const scoreTable = document.createElement('table');
	scoreTable.className = 'mx-auto my-6 border-collapse w-96 bg-gray-800 rounded-xl shadow-lg text-white';
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	headerRow.innerHTML = `
        <th class="py-3 px-6 border-b border-gray-700 text-left">Player</th>
        <th class="py-3 px-6 border-b border-gray-700 text-right">Score</th>
    `;
	thead.appendChild(headerRow);
	scoreTable.appendChild(thead);

	// Corps du tableau
	const tbody = document.createElement('tbody');
	for (let i = 0; sorted[i]; i++) {
		const row = document.createElement('tr');
		row.className = 'mb-2 rounded bg-gray-700 hover:bg-gray-500';
		const player = sorted[i];
		if (i === 0) {
			row.className += ' border border-yellow-500';
			player.nickName = '🥇 ' + sorted[i].nickName;
		}
		if (i === 1) {
			row.className += ' border border-gray-100';
			player.nickName = '🥈 ' + sorted[i].nickName;
		}
		if (i === 2) {
			row.className += ' border border-orange-500';
			player.nickName = '🥉 ' + sorted[i].nickName;
		}
		row.innerHTML = `
            <td class="py-2 px-6 border-b border-gray-700">${player.nickName}</td>
            <td class="py-2 px-6 border-b border-gray-700 text-right font-bold">${player.totalScore}</td>
        `;
		tbody.appendChild(row);
	}
	scoreTable.appendChild(tbody);

	form.appendChild(scoreTable);
}

function drawFinalBoard() {
	const winner = tournament.players.find(player => !player.eliminated);
	const endTitle = drawTitle(`Tournament finished !`);
	let end = drawTitle(`Winner is ${winner?.nickName}`);
	end.className = 'text-2xl font-bold text-white';
	form.appendChild(endTitle);
	form.appendChild(end);
	drawScoreBoard();
	tournament.socket.emit('winner', winner?.nickName); // string
	// -> socket.on("winner", (winner: string) =>{
	//})
	const button = document.createElement('button');
	button.type = 'button';
	button.id = 'returnDashboard';
	button.textContent = `Return to Dashboard`;
	button.className = 'rounded-lg bg-gray-700 hover:bg-gray-500 hover:outline hover:outline-yellow-500 px-4 py-2 text-white';
	button.addEventListener('click', () => {
		navigateTo('/dashboard');
	});
	form.appendChild(button);
}

// display and fill next matchs of display scoreboard when finished
function showNextMatch() {
	form.innerHTML = '';
	if (currentRound > tournament.rounds.max) {
		drawFinalBoard();
		return;
	}
	const roundGames = tournament.rounds.games[currentRound];
	if (currentMatch >= roundGames.length) {
		currentRound++;
		currentMatch = 0;
		tournament.rounds.nb = currentRound;
		if (tournament.rounds.nb > tournament.rounds.max) {
			showNextMatch();
			return;
		}
		tournament.fillRound();
		showNextMatch();
		return;
	}
	const title = drawTitle(`Round ${currentRound + 1}`);
	const brackets = drawBrackets(currentMatch, currentRound);
	const roundButton = nextMatchButton(roundGames[currentMatch]);
	form.appendChild(title);
	form.appendChild(brackets);
	form.appendChild(roundButton);
	const sorted = tournament.players.sort((a, b) => b.totalScore - a.totalScore);
	roundButton.addEventListener('click', () => {
		form.innerHTML = '';
		initGame(tournament.rounds.games[currentRound][currentMatch]);
		showCountdown(form);
		setTimeout(() => {
			gameStart = true;
			startMainLoop(tournament.rounds.games[currentRound][currentMatch]);
			if (!gameStart) {
				currentMatch++;
				showNextMatch();
			}
		}, 3400);
	});
}

// send names submited to create the tournament
function submitNames(container: HTMLDivElement) {
	const button = document.createElement('button');
	button.type = 'button';
	button.id = 'submitNames';
	button.textContent = 'Play !';
	button.className = 'mt-4 rounded-lg bg-gray-800 hover:bg-gray-600 px-4 py-2 text-white';
	container.appendChild(button);
	button.addEventListener('click', () => {
		if (checkSubmited(container)) return;
		container.hidden = true;
		deleteElem('submitName');
		tournament = new Tournament(names);
		tournament.fillRound();
		showNextMatch();
	});
}

// tournament function
export function pongTournament() {
	let firstInput = '';
	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;
	let socket = io(`${protocol}//${host}:${port}/tournament`);
	let cookie = getCookie('token');
	socket.on('connect', () => {
		socket.emit('getPlayerName', cookie);
	});
	socket.on('NameIs', async (name: string) => {
		firstInput = name;
		socket.disconnect();
		socket.off();
	});
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
		const uiInput = getPlayersName(nbPlayers, firstInput);
		playerForm.hidden = true;
		if (uiInput) form.append(uiInput);
	});
}
