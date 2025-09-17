import { SnakeGameHistory } from '../types/snakeTypes';
import { updateUserProfilePong } from './profilePongFr';
import { updateRankingPong } from './rankPong';
import { PongGameHistory } from '../types/pongTypes';
import { formatDate, formatGameTime } from './init';
import { analyzeGameTimes, analyzeLengthDistribution, analyzeBallSpeedDistribution, analyzePongGameTimes } from '../graph/gameTime';
import { setCurrentGamesPong, showGameDetailsPong, closeGameDetailsPong } from '../graph/popPong';


// console.log('Snake stats file loaded');
declare var Chart: any;

export function initPongStats(){
	// console.log('=============> initPongStats called');
	const tryInit = async() => {
		// console.log('tryInit called');
		const scoreCanvas = document.getElementById('scoreDistributionChart');
		const timeCanvas = document.getElementById('survivalTimeChart');
		// console.log('Canvas found:', scoreCanvas, timeCanvas);

		const lastGamesContainer = document.querySelector('#last-games-content');
		// console.log('Last games container found:', lastGamesContainer);

		if (!scoreCanvas || !timeCanvas) {
			// console.log('Canvas not found, retrying...');
			setTimeout(tryInit, 50);
			return;
		}

        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = urlParams.get('user');

		// console.log('Creating charts...');
		const scoreCtx = (scoreCanvas as HTMLCanvasElement).getContext('2d');
        if(scoreCtx) {
            const speedData = await analyzeBallSpeedDistribution(targetUserId || undefined); // Fonction Pong

            new Chart(scoreCtx, {
                type: 'bar',
                data: {
                    labels: speedData.labels,
                    datasets: [{
                        label: 'Number of games',
                        data: speedData.data,
                        backgroundColor: ['#0F4E77', '#72524A', '#89A377', '#b7dbf1'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        const timeCtx = (timeCanvas as HTMLCanvasElement).getContext('2d');
        if(timeCtx){
            const timeData = await analyzePongGameTimes(targetUserId || undefined); // Fonction Pong

            new Chart(timeCtx, {
                type: 'doughnut',
                data: {
                    labels: timeData.labels,
                    datasets: [{
                        data: timeData.data,
                        backgroundColor: ['#FBD271', '#89A377', '#0F4E77', '#72524A'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '60%'
                }
            });
        }

        // Vos fonctions Pong existantes
        if (lastGamesContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const targetUserId = urlParams.get('user');

            updateLastGamesPong(targetUserId || undefined);
            updateRankingPong();
            updateUserProfilePong();
        }
    };
    tryInit();
}


// Votre fonction devrait ressembler à ça :
export async function fetchPongHistory(): Promise<PongGameHistory[]> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/user/history?type=pong`);
        if (response.ok) {
            const history: PongGameHistory[] = await response.json(); // Type correct ici
            return history;
        }
        return [];
    } catch (error) {
        console.log('Error fetching pong history:', error);
        return [];
    }
}

function generateLastGamesHTML(games: PongGameHistory[], targetUserId?: string, targetUserName?: string): string {
	if (games.length === 0) {
		return `
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<p class="text-gray-500 text-sm">Yes...😢 you have to play if you want data</p>
			</div>
		`;
	}

	const lastGames = games.slice(0, 3);

	return lastGames.map((game, index) => {
		// let leftPlayer = 'YOU';
		// let rightPlayer = game.opponentLogin || 'Opponent';

        let leftPlayer, rightPlayer;
        
        if (targetUserId && targetUserName) {
            // Si on regarde le profil d'un autre utilisateur
            leftPlayer = targetUserName; // Le nom de l'utilisateur dont on regarde le profil
            rightPlayer = game.opponentLogin || 'Opponent';
        } else {
            // Si on regarde son propre profil
            leftPlayer = 'YOU';
            rightPlayer = game.opponentLogin || 'Opponent';
        }

		if (game.win === 'WIN') {
			leftPlayer = '👑 YOU';
		} else if (game.win === 'LOOSE') {
			rightPlayer = '👑 ' + rightPlayer;
		}

			return `
			<div class="grid grid-cols-3 gap-4 items-center p-3 rounded-lg border-b cursor-pointer hover:bg-gray-50 transition-colors" onclick="showGameDetailsPong(${index})" data-game-index="${index}">
				<div class="min-w-0">
					<p class="font-semibold text-sm truncate">${leftPlayer}</p>
					<p class="text-gray-500 text-xs">${formatDate(game.date || '')}</p>
				</div>
				<div class="text-center flex-shrink-0">
					<span class="text-lg font-bold">VS</span>
					${game.win === 'DRAW' ? '<div class="text-xs text-blue-500">DRAW</div>' : ''}
				</div>
				<div class="text-right min-w-0">
					<p class="font-semibold text-sm truncate">
						${rightPlayer}
					</p>
					<p class="text-gray-500 text-xs truncate">
						${formatGameTime(game.gameTime || 0)} • Speed: ${game.finalBallSpeed}
					</p>
				</div>
			</div>
		`;
		}).join('');
}


export async function updateLastGamesPong(targetUserId?: string): Promise<void> {
    try {
        let games;
        if (targetUserId) {
            games = await fetchPongHistoryOther(targetUserId);
        } else {
            games = await fetchPongHistory();
        }
        
        setCurrentGamesPong(games);
        const lastGamesContainer = document.querySelector('#last-games-content');
        if (lastGamesContainer) {
            if (!games || games.length === 0) {
                lastGamesContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-center">
                        <p class="text-gray-500 text-sm">No games played yet</p>
                    </div>
                `;
            } else {
                const displayName = document.getElementById('profile-display-name')?.textContent;
                lastGamesContainer.innerHTML = generateLastGamesHTML(games, targetUserId, displayName || undefined);
            }
        }
    } catch (error) {
        console.log('Error updating last games:', error);
        setCurrentGamesPong([]);
    }
}

export async function fetchPongHistoryOther(targetUserId: string): Promise<PongGameHistory[]> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        
        const response = await fetch(`${protocol}//${host}:${port}/api/pong/history/${targetUserId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch pong history for other user');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching other user pong history:', error);
        return [];
    }
}


declare global {
	interface Window {
		showGameDetailsPong: (index: number) => void;
		closeGameDetailsPong: (event?: Event) => void;
	}
}

window.showGameDetailsPong = showGameDetailsPong;
window.closeGameDetailsPong = closeGameDetailsPong;
