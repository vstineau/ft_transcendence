import { PongGameHistory } from '../types/pongTypes';
import { formatGameTime, formatDate } from '../graph/init';

export let currentGames: PongGameHistory[] = [];

export function setCurrentGamesPong(games: PongGameHistory[]): void {
	currentGames = games;
}

export function showGameDetailsPong(gameIndex: number): void {
	const game = currentGames[gameIndex];
	if (!game) return;

	const isWin = game.win === 'WIN';
	const isDraw = game.win === 'DRAW';
	const userData = localStorage.getItem('currentUser');
	const currentUser = userData ? JSON.parse(userData) : { login: 'Player' };

	// Couleur selon le résultat
	let bgColor, textColor, accentColor;
	if (isDraw) {
		bgColor = 'bg-[#B7DBF1]';
		textColor = 'text-[#72524A]';
		accentColor = 'text-[#647458]';
	} else if (isWin) {
		bgColor = 'bg-[#96BD7B]';
		textColor = 'text-white';
		accentColor = 'text-[#72524A]'
	} else {
		bgColor = 'bg-[#632024]';
		textColor = 'text-white';
		accentColor = 'text-[#96BD7B]'
	}


	let shadowColor;
	if (isDraw) {
		shadowColor = 'shadow-[0_10px_25px_rgba(183,219,241,0.7)]';
	} else if (isWin) {
		shadowColor = 'shadow-[0_10px_25px_rgba(150,189,123,0.7)]';
	} else {
		shadowColor = 'shadow-[0_10px_25px_rgba(99,32,36,0.7)]';
	}

	// Texte du résultat
	const resultText = isDraw ? 'DRAW' : (isWin ? 'WIN' : 'LOSS');

	const popupHTML = `
		<div id="game-popup" class="fixed inset-0 bg-white/10 backdrop-blur flex items-center justify-center z-50" onclick="closeGameDetails(event)">
			<div class="${bgColor} rounded-xl p-4 max-w-xl h-[350px] w-full mx-4 transform transition-all duration-300 scale-95 relative flex flex-col flex flex-col justify-start ${textColor} ${shadowColor}" onclick="event.stopPropagation()">

			<!-- Croix de fermeture -->
				<button onclick="closeGameDetailsPong()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>

			<!-- Header avec date et heure -->
				<div class="rounded-lg pt-2 px-4 pb-4 text-center">
				<div class="text-sm ${accentColor}">${formatDate(game.date || '')}</div>
				<div class="text-xs ${textColor}">Game time</div>
				<div class="text-lg ${accentColor}">${formatGameTime(game.gameTime || 0)}</div>

			</div>

				<!-- Section VS avec couronne -->
				<div class="flex items-center justify-between">
					<div class="text-center flex-1">
						<!-- Espace couronne -->
						<div class="text-4xl mb-2 h-8 flex items-center justify-center">
							${(isWin && !isDraw) ? '👑' : ''}
						</div>
						<div class="font-bold text-lg ">${currentUser.login}</div>
						<div class="text-sm mb-4 ${accentColor}">You</div>

						<div class="text-sm mt-1">
							<span class="${textColor}">Final ball speed : </span><span class="${accentColor}">${game.finalBallSpeed || 0}</span>
						</div>
						<div class="text-sm">
							<span class="${textColor}">Average speed : </span><span class="${accentColor}">${game.opponentStats?.finalBallSpeed || '-'}</span>
						</div>
					</div>

					<div class="text-center px-4">
						<div class="text-4xl font-bold ${accentColor}">
							${isDraw ? "DRAW" : "VS"}
						</div>
					</div>

					<div class="text-center flex-1">
						<!-- Espace réservé pour la couronne (toujours présent) -->
						<div class="text-2xl mb-2 h-8 flex items-center justify-center">
							${(!isWin && !isDraw) ? '👑' : ''}
						</div>
						<div class="font-bold text-lg">${game.opponentLogin || 'Opponent'}</div>
						<div class="text-sm mb-4 ${accentColor}">Opponent</div>

						<div class="text-sm mt-1">
							<span class="${textColor}">Final ball speed : </span><span class="${accentColor}">${game.opponentStats?.finalBallSpeed || '-'}</span>
						</div>
						<div class="text-sm">
							<span class="${textColor}">Average speed : </span><span class="${accentColor}">${game.opponentStats ? Math.max((game.opponentStats.finalBallSpeed || 1) - 1, 0) : '-'}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	// Ajouter le popup au DOM
	document.body.insertAdjacentHTML('beforeend', popupHTML);

	// Animation d'ouverture
	setTimeout(() => {
		const popup = document.getElementById('game-popup');
		const content = popup?.querySelector('div > div');
		if (content) {
			content.classList.remove('scale-95');
			content.classList.add('scale-100');
		}
	}, 10);
}

export function closeGameDetailsPong(event?: Event): void {
	if (event) {
		event.preventDefault();
	}

	const popup = document.getElementById('game-popup');
	if (popup) {
		const content = popup.querySelector('div > div');
		if (content) {
			content.classList.remove('scale-100');
			content.classList.add('scale-95');
		}

		setTimeout(() => {
			popup.remove();
		}, 200);
	}
}

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeGameDetailsPong();
	}
});

