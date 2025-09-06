import { SnakeGameHistory } from '../types/snakeTypes';
import { formatGameTime, formatDate } from '../graph/init';

export let currentGames: SnakeGameHistory[] = [];

export function setCurrentGames(games: SnakeGameHistory[]): void {
    currentGames = games;
}

export function showGameDetails(gameIndex: number): void {
    const game = currentGames[gameIndex];
    if (!game) return;

    const isWin = game.win === 'WIN';
    const isDraw = game.win === 'DRAW';
    const userData = localStorage.getItem('currentUser');
    const currentUser = userData ? JSON.parse(userData) : { login: 'Player' };

    // Couleur selon le résultat
    let bgColor, textColor;
    if (isDraw) {
        bgColor = 'bg-blue-400';
        textColor = 'text-white';
    } else if (isWin) {
        bgColor = 'bg-green-500';
        textColor = 'text-white';
    } else {
        bgColor = 'bg-red-800';
        textColor = 'text-white';
    }

    // Texte du résultat
    const resultText = isDraw ? 'DRAW' : (isWin ? 'WIN' : 'LOSS');

    const popupHTML = `
        <div id="game-popup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeGameDetails(event)">
            <div class="${bgColor} ${textColor} rounded-xl p-6 max-w-xl h-[350px] w-full mx-4 transform transition-all duration-300 scale-95 relative" onclick="event.stopPropagation()">

			<!-- Croix de fermeture -->
				<button onclick="closeGameDetails()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>

			<!-- Header avec date et heure -->
                <div class="rounded-lg pt-1 px-4 pb-4 mb-4 text-center">
                    <div class="text-sm opacity-90">${formatDate(game.date || '')}</div>
                    <div class="text-xs opacity-75">Game time: ${formatGameTime(game.gameTime || 0)}</div>
                    ${isDraw ? '<div class="text-lg font-bold mt-2">DRAW</div>' : ''}
                </div>

                <!-- Section VS avec couronne -->
                <div class="flex items-center justify-between mb-6">
                    <div class="text-center flex-1 mt-12">
                        ${(isWin && !isDraw) ? '<div class="text-2xl mb-2">👑</div>' : ''}
                        <div class="font-bold text-lg">${currentUser.login}</div>
                        <div class="text-sm text-gray-600 mb-2">You</div>
                        <div class="text-sm mt-1">
                            <span class="text-gray-500">Length:</span> ${game.finalLength || 0}
                        </div>
                        <div class="text-sm">
                            <span class="text-gray-500">Max size:</span> ${game.finalLength || 0}
                        </div>
                    </div>

                    <div class="text-center px-4">
                        <div class="text-2xl font-bold text-gray-400">VS</div>
                    </div>

                    <div class="text-center flex-1">
                        ${(!isWin && !isDraw) ? '<div class="text-2xl mb-2">👑</div>' : ''}
                        <div class="font-bold text-lg">${game.opponent || 'Opponent'}</div>
                        <div class="text-sm text-gray-600">Opponent</div>
                        <div class="text-sm mt-1">
                            <span class="text-gray-500">Length:</span> -
                        </div>
                        <div class="text-sm">
                            <span class="text-gray-500">Max size:</span> -
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

export function closeGameDetails(event?: Event): void {
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
        closeGameDetails();
    }
});

