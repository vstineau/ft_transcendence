import { StatsSnakeView } from '../views/root.views';
import { SnakeGameHistory } from '../types/snakeTypes';
import { authenticatedFetch} from '../main';


console.log('Snake stats file loaded');
declare var Chart: any;

export function initSnakeStats(){
	console.log('=============> initSnakeStats called');
	const tryInit = () => {
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
        // Créer les graphiques SEULEMENT si les éléments existent
        const scoreCtx = (scoreCanvas as HTMLCanvasElement).getContext('2d');
        if(scoreCtx) {
            new Chart(scoreCtx, {
                type: 'bar',
                data: {
                    labels:['0-10', '11-20', '21-30', '31-40', '41-50', '51+'],
                    datasets: [{
                        label: 'Number of games',
                        data: [8, 12, 15, 10, 5, 2],
                        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } }

                }
            });
        }

        const timeCtx = (timeCanvas as HTMLCanvasElement).getContext('2d');
        if(timeCtx){
            new Chart(timeCtx, {
                type: 'doughnut',
                data: {
                    labels: ['0-30s', '31-60s', '61-90s', '90s+'],
                    datasets: [{
                        data: [30, 35, 25, 10],
                        backgroundColor: ['#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
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
        } else {
            console.error('Element #last-games-content not found!');
            // Réessayer après un délai comme pour les canvas
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

    // Démarrer la vérification
    tryInit();
}


async function fetchSnakeHistory(): Promise<SnakeGameHistory[]> {
    try {
        console.log('=== FETCHING SNAKE HISTORY ===');
        console.log('Current cookies:', document.cookie);

        const response = await authenticatedFetch(`http://localhost:3000/api/user/history?type=snake`);

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('History data received:', data);
        return data;
    } catch (error) {
        console.log('Error fetching snake history', error);
        return [];
    }
}


function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit'
	});
}

function formatGameTime(timeInMs: number): string {
	const seconds = Math.floor(timeInMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes > 0) {
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	return `${seconds}s`;
}

function generateLastGamesHTML(games: SnakeGameHistory[]): string {
	if (games.length === 0) {
		return `
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<p class="text-gray-500 text-sm">Yes...😔 you have to play if you want data</p>
			</div>
		`;
	}

	// Prendre seulement les 3 dernieres parties
	const lastGames = games.slice(-3).reverse();

	return lastGames.map(game => `
		<div class="grid grid-cols-3 gap-4 items-center p-3 rounded-lg border-b">
			<div class="min-w-0">
				<p class="font-semibold text-sm truncate">YOU</p>
				<p class="text-gray-500 text-xs">${formatDate(game.date || '')}</p>
			</div>
			<div class="text-center flex-shrink-0">
				<span class="text-lg font-bold">VS</span>
			</div>
			<div class="text-right min-w-0">
				<p class="font-semibold text-sm px-2 py-1 rounded truncate ${game.win === 'win' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
					${game.opponent} pts
				</p>
				<p class="text-gray-500 text-xs truncate">
					${formatGameTime(game.gameTime || 0)} • Length: ${game.finalLength}
				</p>
			</div>
		</div>
	`).join('');
}

export async function updateLastGames(): Promise<void> {
    console.log('updateLastGames called');

    try {
        const games = await fetchSnakeHistory();
        console.log('Games fetched:', games);

        const lastGamesContainer = document.querySelector('#last-games-content');
        console.log('Container in updateLastGames:', lastGamesContainer);

        if (lastGamesContainer) {
            const html = generateLastGamesHTML(games);
            console.log('Generated HTML:', html);
            lastGamesContainer.innerHTML = html;
        }
    } catch (error) {
        console.error('Error updating last games:', error);
    }
}

