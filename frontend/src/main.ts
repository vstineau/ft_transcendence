// import { register } from 'ts-node';
import { registerUser } from './user/register';
import { logUser, initTwoFALogin, TwoFAVerifyView } from './user/login';
import { rootUser } from './user/root';
import { updateInfos } from './user/updateInfos';
import { displayChatButton } from './utils/chat_tools';
import {
	LoginView,
	GamesView,
	PongChoice,
	SnakeChoice,
	PongView,
	StatsPongView,
	StatsSnakeView,
	RegisterView,
	UpdateInfosview,
	RootView,
	PongMatchMakingView,
	PongCanvas,
	localPongCanvas,
	SnakeCanvas,
	localSnakeCanvas,
	WelcomeView,
	pongTournamentView,
} from './views/root.views';
import { pongGame } from './pong/pong';
import { initScrollAnimations, cleanupScrollAnimations } from './utils/animations';
import { initThemeToggle, cleanupThemeToggle } from './theme/darkMode';
import { snakeGame } from './snake/snake';
import { localSnakeGame } from './snake/localSnake';
import { localpongGame } from './pong/localPong';
import { initProfilePage } from './utils/avatar';
import { initSnakeStats } from './graph/init';
import { initPongStats } from './graph/initPong';
import { pongTournament } from './pong/tournament';
import { updateRanking } from './graph/rank';
import { updateRankingPong } from './graph/rankPong';
import { updateUserProfile } from './graph/profileSnakeFr';
import { updateUserProfilePong } from './graph/profilePongFr';
import { updateRecentContacts } from './chat/recentContents';
import { displayDarkModeButton } from './theme/lightButton'
import { initLanguageSelector, initializeLanguage, languageManager } from './lang/languageManager';
import { showProfileDetails } from './user/popProfile'

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': async () => {
        // Vérifier si l'utilisateur est connecté
        const token = document.cookie.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        const isLoggedIn = !!token;

        // Retourner la vue avec le bon paramètre
        return await WelcomeView(isLoggedIn);
    },
	'/dashboard': RootView,
	'/games': GamesView,
	'/pong-choice': PongChoice,
	'/snake-choice': SnakeChoice,
	'/pong': PongView,
	'/pong/matchmaking': PongMatchMakingView,
	'/pong/matchmaking/game': PongCanvas,
	'/pong/matchmaking/localgame': localPongCanvas,
	'/pong/leaderboard': async () => '<h1>leaderboard</h1>',
	'/pong/stats': async () => '<h1>stats</h1>',
	'/pong/tournament': pongTournamentView,
	'/login': LoginView,
	'/logout': async () => '<h1>LOGOUT</h1>',
	'/snake': SnakeCanvas,
	'/snake/local': localSnakeCanvas,
	'/register': RegisterView,
	'/updateInfos': UpdateInfosview,
	'/2fa-verification': TwoFAVerifyView,
	// '/statisticsPong': StatsPongView,
	'/statisticsPong': async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = urlParams.get('user');

        if (targetUserId) {
            return await StatsPongView(targetUserId);
        } else {
            return await StatsPongView();
        }
    },
	'/statisticsSnake': async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = urlParams.get('user');

        if (targetUserId) {
            return await StatsSnakeView(targetUserId);
        } else {
            return await StatsSnakeView();
        }
    },
};

export async function navigateTo(url: string) {
	// Nettoyer les animations de la page précédente
	cleanupScrollAnimations();
	cleanupThemeToggle();

	history.pushState(null, '', url);
	await renderPage();
}


export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
	const response = await fetch(url, {
		...options,
		credentials: 'include',
	});

	if (response.status == 401) {
		console.log('Token expired, redirecting to login');
		localStorage.clear();
		navigateTo('/');
		throw new Error('Authentification expired');
	}
	return response;
}

// Créer une notification toast au lieu d'une alerte
function showAuthMessage() {
	const message = document.createElement('div');
	message.textContent = 'Session expired. Please log in to continue.';
	message.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #f87171; color: white;
        padding: 12px 20px; border-radius: 8px; z-index: 1000;
        font-family: system-ui; font-size: 14px;
    `;
	document.body.appendChild(message);
	setTimeout(() => message.remove(), 3000);
}

export async function renderPage() {
	const path = window.location.pathname;
	console.log('Current path:', path);
    console.log('Route exists:', !!routes[path]);


	const publicPaths = [
		'/',
		'/login',
		'/register',
		'/pong/matchmaking/game',
		'/pong/matchmaking/localgame',
		'/pong',
		'/2fa-verification',
		'/pong/local',
		'/snake',
		'/snake/local',
	];

	let favLangChecked = false;

	// Pour les paths non publics, vérifie la langue préférée de l'utilisateur
	if (!publicPaths.includes(path)) {
		try {
			await authenticatedFetch('/api/updateInfos');
			// Récupération du favlang
			if (!favLangChecked) {
				const host = window.location.hostname;
        		const port = window.location.port;
        		const protocol = window.location.protocol;

        		const response = await fetch(`${protocol}//${host}:${port}/api/`);
				if (response.status === 200) {
					const repBody = await response.json();
					const favLang = repBody.favLang;
					if (favLang && ['en', 'fr', 'es'].includes(favLang) && favLang !== languageManager.getCurrentLanguage()) {
						languageManager.setLanguage(favLang);
						languageManager.updatePageTranslations();
					}
				}
				favLangChecked = true;
			}
		} catch {
			showAuthMessage();
			localStorage.clear();
			navigateTo('/');
			return;
		}
	}



	cleanupScrollAnimations();
	cleanupThemeToggle();

	const view = routes[path] ? await routes[path]() : '<h1>404 Not Found</h1>';
	const rootElement: HTMLElement | null = document.getElementById('root');


	if (rootElement) {
		rootElement.innerHTML = view;
	}
	// Initialiser les fonctionnalités spécifiques à chaque page
	switch (path) {
		case '/':
			WelcomeView();
			setTimeout(() => {
				initScrollAnimations();
				initThemeToggle();
				initLanguageSelector();
			}, 100);
			break;
		case '/dashboard':
			rootUser();
			displayChatButton();
			setTimeout(async () => {
				initThemeToggle();
				await initProfilePage();
				await updateRecentContacts();
				await displayChatButton();
				initLanguageSelector();
				const viewBtn = document.getElementById('view-profile-btn');
				if (viewBtn) {
					viewBtn.addEventListener('click', showProfileDetails);
				}
				try {
					await authenticatedFetch('/api/updateInfos');
					updateUserProfile();
					updateUserProfilePong();
				} catch {
					console.log('Not authenticated, skipping profile update');
				}
			}, 100);
			break;
		case '/updateInfos':
			initThemeToggle();
			await displayDarkModeButton();
			initLanguageSelector();
			await updateInfos();
			await displayChatButton();
			break;
		case '/register':
			await displayDarkModeButton();
			await registerUser();
			initThemeToggle();
			initLanguageSelector();
			break;
		case '/login':
			await logUser();
			initThemeToggle();
			await displayDarkModeButton();
			initLanguageSelector();
			break;
		case '/pong/matchmaking/game':
			await pongGame();
			await displayChatButton();
			break;
		case '/pong/matchmaking/localgame':
			localpongGame();
			await displayChatButton();
			break;
		case '/snake':
			await snakeGame();
			break;
		case '/snake/local':
			await displayDarkModeButton();
			localSnakeGame();
			await displayChatButton();
			break;
		case '/2fa-verification':
			initTwoFALogin();
			break;
		case '/statisticsSnake':
			setTimeout(async() => {
				initThemeToggle();
				await displayDarkModeButton();
				initSnakeStats();
				updateRanking();
				
				const urlParams = new URLSearchParams(window.location.search);
				const targetUserId = urlParams.get('user');
				
				if (!targetUserId) {
					// Seulement pour vos propres stats
					updateInfos();
					initProfilePage();
					try {
						await authenticatedFetch('/api/updateInfos');
						updateUserProfile();
					} catch {
						console.log('Not authenticated, skipping profile update');
					}
				}
				document.getElementById('pong-stats-btn')?.addEventListener('click', () => {
					const params = new URLSearchParams(window.location.search);
					const userId = params.get('user');
					navigateTo(`/statisticsPong${userId ? `?user=${userId}` : ''}`);
				});

				document.getElementById('snake-stats-btn')?.addEventListener('click', () => {
					const params = new URLSearchParams(window.location.search);
					const userId = params.get('user');
					navigateTo(`/statisticsSnake${userId ? `?user=${userId}` : ''}`);
				});

			}, 100);
			break;
		case '/statisticsPong':
			setTimeout(async () => {
				console.log('About to call initPongStats');
				initThemeToggle();
				await displayDarkModeButton();
				initPongStats();
				updateRankingPong();
				
				// Même logique que Snake : ne pas appeler updateInfos/initProfilePage si on regarde un autre utilisateur
				const urlParams = new URLSearchParams(window.location.search);
				const targetUserId = urlParams.get('user');
				
				if (!targetUserId) {
					// Seulement pour vos propres stats
					updateInfos();
					initProfilePage();
					try {
						await authenticatedFetch('/api/updateInfos');
						updateUserProfilePong();
					} catch {
						console.log('Not authenticated, skipping profile update');
					}
				}
				
				// Ajouter les event listeners pour les boutons Snake/Pong
				document.getElementById('snake-stats-btn')?.addEventListener('click', () => {
					const params = new URLSearchParams(window.location.search);
					const userId = params.get('user');
					navigateTo(`/statisticsSnake${userId ? `?user=${userId}` : ''}`);
				});

				document.getElementById('pong-stats-btn')?.addEventListener('click', () => {
					const params = new URLSearchParams(window.location.search);
					const userId = params.get('user');
					navigateTo(`/statisticsPong${userId ? `?user=${userId}` : ''}`);
				});
				
			}, 100);
			break;
		case '/pong/tournament':
			pongTournament();
			displayChatButton();
			break;
		case '/pong-choice':
			languageManager.updatePageTranslations();
			break;
		case '/snake-choice':
			languageManager.updatePageTranslations();
			break;
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	await initializeLanguage();
	updateUserProfile();
	updateUserProfilePong();

	document.body.addEventListener('click', async e => {
		const target = e.target as HTMLElement;
		// if (target instanceof HTMLAnchorElement)
		if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('/')) {
			e.preventDefault();
			await navigateTo((target as HTMLAnchorElement).getAttribute('href')!);
		}
	});

	// 5. Gère le bouton "Retour" du navigateur
	window.addEventListener('popstate', () => {
		renderPage();
	});

	// 6. Rendu initial
	await renderPage();
});
