import { StatsSnakeView } from '../views/root.views';
import { SnakeGameHistory } from '../types/snakeTypes';
import { updateUserProfile } from './profileSnakeFr';
import { updateRanking } from './rank';
import { analyzeGameTimes, analyzeLengthDistribution } from '../graph/gameTime';
import { currentGames, setCurrentGames, showGameDetails, closeGameDetails } from '../graph/pop';


console.log('Snake stats file loaded');
declare var Chart: any;

export function initSnakeStats(){
	console.log('=============> initSnakeStats called');
	const tryInit = async() => {
		console.log('tryInit called');
		const scoreCanvas = document.getElementById('scoreDistributionChart');
		const timeCanvas = document.getElementById('survivalTimeChart');
		console.log('Canvas found:', scoreCanvas, timeCanvas);

		const lastGamesContainer = document.querySelector('#last-games-content');
        console.log('Last games container found:', lastGamesContainer);

		if (!scoreCanvas || !timeCanvas) {
			console.log('Canvas not found, retrying...');
			setTimeout(tryInit, 50);
			return;
		}

		console.log('Creating charts...');
        const scoreCtx = (scoreCanvas as HTMLCanvasElement).getContext('2d');
        if(scoreCtx) {
                const lengthData = await analyzeLengthDistribution();

                new Chart(scoreCtx, {
                    type: 'bar',
                    data: {
                        labels: lengthData.labels,
                        datasets: [{
                            label: 'Number of games',
                            data: lengthData.data,
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
            const timeData = await analyzeGameTimes();

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

		if (lastGamesContainer) {
            console.log('Calling updateLastGames...');
            updateLastGames();
            updateRanking();
            updateUserProfile();
        } else {
            console.error('Element #last-games-content not found!');
            // Reessayer apres un delai comme pour les canvas
            setTimeout(() => {
                const container = document.querySelector('#last-games-content');
                if (container) {
                    console.log('Found container on retry, calling updateLastGames...');
                    updateLastGames();
                } else {
                    console.error('Still no #last-games-content found after retry');
                }
            }, 100);
		}
    };

    tryInit();
}


export async function fetchSnakeHistory(): Promise<SnakeGameHistory[]> {
    try {
        console.log('=== FETCHING SNAKE HISTORY ===');
        console.log('Current cookies:', document.cookie);
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/user/history?type=snake`);

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

         const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching snake history', error);
        return [];
    }
}


export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit'
	});
}

export function formatGameTime(timeInMs: number): string {
	const seconds = Math.floor(timeInMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes > 0) {
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	return `${seconds}s`;
}

// function generateLastGamesHTML(games: SnakeGameHistory[]): string {
//     console.log('=== generateLastGamesHTML ===');
//     console.log('Total games received:', games.length);
//     console.log('Games data:', games.map(g => ({
//         date: g.date,
//         opponent: g.opponent,
//         win: g.win
//     })));
//     if (games.length === 0) {
//         return `
//             <div class="flex flex-col items-center justify-center py-8 text-center">
//                 <p class="text-gray-500 text-sm">Yes...😢 you have to play if you want data</p>
//             </div>
//         `;
//     }

//     // Prendre les 3 dernières parties
//     const lastGames = games.slice(0, 3);
//     console.log('Last games to display:', lastGames.length);

//     return lastGames.map((game, index )=> {
//         let leftPlayer = 'YOU';
//         let rightPlayer = game.opponent || 'Opponent';

//         // Ajouter les couronnes selon le résultat
//         if (game.win === 'WIN') {
//             leftPlayer = '👑 YOU';
//         } else if (game.win === 'LOOSE') {
//             rightPlayer = '👑 ' + rightPlayer;
//         }

//         return `
//             <div class="grid grid-cols-3 gap-4 items-center p-3 rounded-lg border-b">
//                 <div class="min-w-0">
//                     <p class="font-semibold text-sm truncate">${leftPlayer}</p>
//                     <p class="text-gray-500 text-xs">${formatDate(game.date || '')}</p>
//                 </div>
//                 <div class="text-center flex-shrink-0">
//                     <span class="text-lg font-bold">VS</span>
//                 </div>
//                 <div class="text-right min-w-0">
//                     <p class="font-semibold text-sm truncate">
//                         ${rightPlayer}
//                     </p>
//                     <p class="text-gray-500 text-xs truncate">
//                         ${formatGameTime(game.gameTime || 0)} • Length: ${game.finalLength}
//                     </p>
//                 </div>
//             </div>
//         `;
//     }).join('');
// }

function generateLastGamesHTML(games: SnakeGameHistory[]): string {
    if (games.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center py-8 text-center">
                <p class="text-gray-500 text-sm">Yes...😢 you have to play if you want data</p>
            </div>
        `;
    }

    const lastGames = games.slice(0, 3);

    return lastGames.map((game, index) => {
        let leftPlayer = 'YOU';
        let rightPlayer = game.opponent || 'Opponent';

        if (game.win === 'WIN') {
            leftPlayer = '👑 YOU';
        } else if (game.win === 'LOOSE') {
            rightPlayer = '👑 ' + rightPlayer;
        }

            return `
            <div class="grid grid-cols-3 gap-4 items-center p-3 rounded-lg border-b cursor-pointer hover:bg-gray-50 transition-colors" onclick="showGameDetails(${index})" data-game-index="${index}">
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
                        ${formatGameTime(game.gameTime || 0)} • Length: ${game.finalLength}
                    </p>
                </div>
            </div>
        `;
        }).join('');
}


export async function updateLastGames(): Promise<void> {
    try {
        const games = await fetchSnakeHistory();
        setCurrentGames(games); // ← Stocker les parties globalement

        const lastGamesContainer = document.querySelector('#last-games-content');

        if (lastGamesContainer) {
            lastGamesContainer.innerHTML = generateLastGamesHTML(games);
        }
    } catch (error) {
        console.error('Error updating last games:', error);
        setCurrentGames([]);
    }
}

// export async function updateLastGames(): Promise<void> {
//     console.log('updateLastGames called');

//     try {
//         const games = await fetchSnakeHistory();
//         console.log('Games fetched:', games);

//         const lastGamesContainer = document.querySelector('#last-games-content');
//         console.log('Container in updateLastGames:', lastGamesContainer);

//         if (lastGamesContainer) {
//             const html = generateLastGamesHTML(games);
//             console.log('Generated HTML:', html);
//             lastGamesContainer.innerHTML = html;
//         }
//     } catch (error) {
//         console.error('Error updating last games:', error);
//     }
// }


// À la fin de votre fichier init.ts, ajoutez :
declare global {
    interface Window {
        showGameDetails: (index: number) => void;
        closeGameDetails: (event?: Event) => void;
    }
}

window.showGameDetails = showGameDetails;
window.closeGameDetails = closeGameDetails;