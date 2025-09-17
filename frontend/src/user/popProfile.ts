import { SnakeGameHistory, ProfileSnake } from '../types/snakeTypes';
import { ProfilePong } from '../types/pongTypes';
import { navigateTo } from '../main'

export function showProfileDetails(): void {
    // Récupérer les données utilisateur depuis localStorage ou API
    const userData = localStorage.getItem('currentUser');
    const currentUser = userData ? JSON.parse(userData) : { login: 'Player', nickName: 'Player' };

    let bgColor, accentColor;

    bgColor = 'bg-[#C3C98D]';
    accentColor = 'text-[#31243F]';

    const popupHTML =  /* HTML */ `
        <div id="profile-popup" class="fixed inset-0 bg-white/10 backdrop-blur flex items-center justify-center z-50" onclick="closeProfileDetails(event)">
            <div class="${bgColor} rounded-xl p-6 max-w-xl h-[350px] w-full mx-4 transform transition-all duration-300 scale-95 relative shadow-lg" onclick="event.stopPropagation()">

                <!-- Croix de fermeture -->
                <button onclick="closeProfileDetails()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <!-- Header -->
                <div class="rounded-lg pt-2 px-4 pb-4 text-center">
                    <div class="text-sm ${accentColor}">My last games</div>
                </div>

                    <!-- Statistiques rapides -->
                    <div class="p-3">
                            <!-- Bloc Pong avec Total Games -->
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="text-4xl font-bold ${accentColor}">Pong</div>
                                    <span class="text-xl cursor-pointer" onclick="viewPongStats()">↗</span>
                                </div>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <div class="text-lg font-bold text-white">Last game</div>
                                        <div class="text-sm text-white ${accentColor}" id="pong-last-game">-</div>
                                    </div>
                                    <div>
                                        <div class="text-lg font-bold text-white">Classement</div>
                                        <div class="text-sm text-white ${accentColor}" id="pong-ranking">-</div>
                                    </div>
                                    <div>
                                        <div class="text-lg font-bold text-white">Max speed</div>
                                        <div class="text-sm text-white ${accentColor}" id="pong-max-speed">-</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bloc Snake avec Wins -->
                            <div class="mb-4">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="text-4xl font-bold ${accentColor}">Snake</div>
                                    <span class="text-xl cursor-pointer" onclick="viewSnakeStats()">↗</span>
                                </div>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <div class="text-lg font-bold  text-white">Last game</div>
                                        <div class="text-sm text-white ${accentColor}" id="snake-last-game">-</div>
                                    </div>
                                    <div>
                                        <div class="text-lg font-bold  text-white">Classement</div>
                                        <div class="text-sm text-white ${accentColor}" id="snake-ranking">-</div>
                                    </div>
                                    <div>
                                        <div class="text-lg font-bold text-white">Max size</div>
                                        <div class="text-sm text-white ${accentColor}" id="snake-max-size">-</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter le popup au DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Charger les données du profil
    loadProfileData();

    // Animation d'ouverture
    setTimeout(() => {
        const popup = document.getElementById('profile-popup');
        const content = popup?.querySelector('div > div');
        if (content) {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }
    }, 10);
}

async function loadProfileData(): Promise<void> {
    try {
        const profileData = await fetchUserProfileData();

        if (profileData) {
            // Données Snake
            const snakeStats = profileData.snakeStats;
            if (snakeStats) {
                // Last game Snake - récupérer depuis l'historique
                const snakeHistory = await fetchSnakeLastGame();
                const lastGameResult = snakeHistory?.win || 'N/A';
                document.getElementById('snake-last-game')!.textContent = lastGameResult;

                // Classement Snake
                document.getElementById('snake-ranking')!.textContent = snakeStats.stats.ranking.toString();

                // Max size Snake
                document.getElementById('snake-max-size')!.textContent = snakeStats.stats.maxSize.toString();
            }

            // Données Pong (à adapter plus tard)
            const pongStats = profileData.pongStats;
            if (pongStats) {
                // Last game Pong
                const pongHistory = await fetchPongLastGame();
                const pongLastGameResult = pongHistory?.win || 'N/A';
                document.getElementById('pong-last-game')!.textContent = pongLastGameResult;

                // Classement Pong
                document.getElementById('pong-ranking')!.textContent = pongStats.stats.ranking.toString();

                // Max speed Pong
                document.getElementById('pong-max-speed')!.textContent = pongStats.stats.maxSpeed.toString();
            }
        }

    } catch (error) {
        console.log('Error loading profile data:', error);
    }
}


async function fetchPongLastGame(): Promise<{win: string} | null> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/user/history?type=pong`);
        if (response.ok) {
            const history = await response.json();
            return history.length > 0 ? history[0] : null; // Premier élément = plus récent
        }
        return null;
    } catch (error) {
        console.log('Error fetching last Pong game:', error);
        return null;
    }
}

// Fonction pour récupérer la dernière partie Snake
async function fetchSnakeLastGame(): Promise<{win: string} | null> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/user/history?type=snake`);
        if (response.ok) {
            const history = await response.json();
            return history.length > 0 ? history[0] : null; // Premier élément = plus récent
        }
        return null;
    } catch (error) {
        console.log('Error fetching last Snake game:', error);
        return null;
    }
}

export function closeProfileDetails(event?: Event): void {
    if (event) {
        event.preventDefault();
    }

    const popup = document.getElementById('profile-popup');
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

async function fetchUserProfileData(): Promise<{
    avatar?: string;
    totalGames: number;
    totalWins: number;
    snakeStats?: ProfileSnake;
    pongStats?: ProfilePong; // Assumant que vous avez une interface similaire pour Pong
} | null> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        // Récupérer les stats Snake et Pong en parallèle
        const [snakeResponse, pongResponse] = await Promise.all([
            fetch(`${protocol}//${host}:${port}/api/snake/profile`),
            fetch(`${protocol}//${host}:${port}/api/pong/profile`)
        ]);

        const snakeStats: ProfileSnake | null = snakeResponse.ok ? await snakeResponse.json() : null;
        const pongStats: ProfilePong | null = pongResponse.ok ? await pongResponse.json() : null;

        // Calculer les totaux combinés en utilisant vos interfaces
        const snakeTotalGames = snakeStats?.stats?.totalGames || 0;
        const snakeTotalWins = snakeStats?.stats?.totalWins || 0;
        const pongTotalGames = pongStats?.stats?.totalGames || 0;
        const pongTotalWins = pongStats?.stats?.totalWins || 0;

        const totalGames = snakeTotalGames + pongTotalGames;
        const totalWins = snakeTotalWins + pongTotalWins;

        // Utiliser l'avatar depuis ProfileSnake ou ProfilePong
        const avatar = snakeStats?.user?.avatar || pongStats?.user?.avatar;

        return {
            avatar,
            totalGames,
            totalWins,
            snakeStats : snakeStats || undefined,
            pongStats: pongStats || undefined,
        };

    } catch (error) {
        console.log('Error fetching user profile data:', error);
        return {
            avatar: undefined,
            totalGames: 0,
            totalWins: 0
        };
    }
}

function viewSnakeStats(): void {
    closeProfileDetails();
    // Utiliser votre fonction de navigation existante
    navigateTo('/statisticsSnake');
}

function viewPongStats(): void {
    closeProfileDetails();
    navigateTo('/statisticsPong');
}

// Les rendre accessibles globalement
declare global {
    interface Window {
        showProfileDetails: () => void;
        closeProfileDetails: (event?: Event) => void;
        viewSnakeStats: () => void;
        viewPongStats: () => void;
    }
}

window.showProfileDetails = showProfileDetails;
window.closeProfileDetails = closeProfileDetails;
window.viewSnakeStats = viewSnakeStats;
window.viewPongStats = viewPongStats;;

