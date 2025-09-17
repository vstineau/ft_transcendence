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
import { pongGame, disconnectSocket, abortUIListeners } from './pong/pong';
import { initScrollAnimations, cleanupScrollAnimations } from './utils/animations';
import { initThemeToggle, cleanupThemeToggle } from './theme/darkMode';
import { snakeGame, disconnectSocketSnake, abortUIListenersSnake } from './snake/snake';
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
import { displayDarkModeButton } from './theme/lightButton';
import { initLanguageSelector, initializeLanguage, languageManager } from './lang/languageManager';
import { showProfileDetails } from './user/popProfile';

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': async () => {
		// Vérifier si l'utilisateur est connecté
		const token = document.cookie
			.split('; ')
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

// export async function navigateTo(url: string) {
// 	// Nettoyer les animations de la page précédente
// 	cleanupScrollAnimations();
// 	cleanupThemeToggle();

// 	history.pushState(null, '', url);
// 	await renderPage();
// }

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
	const response = await fetch(url, {
		...options,
		credentials: 'include',
	});

	if (response.status == 401) {
		// console.log('Token expired, redirecting to login');
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
	// console.log('Current path:', path);
	// console.log('Route exists:', !!routes[path]);

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
				window.addEventListener('popstate', function (event) {
					// Code à exécuter quand l'utilisateur clique sur "retour en arrière"
					// console.log("L'utilisateur a utilisé le bouton retour du navigateur");
					// Tu peux faire une redirection, afficher un message, etc.
				});
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
			await rootUser();
			await displayChatButton();
			setTimeout(async () => {
				initThemeToggle();
				await initProfilePage();
				await updateRecentContacts();
				initLanguageSelector();
				const viewBtn = document.getElementById('view-profile-btn');
				if (viewBtn) {
					viewBtn.addEventListener('click', showProfileDetails);
				}

				document.querySelectorAll('[data-navigate]').forEach(element => {
					element.addEventListener('click', e => {
						e.preventDefault();
						const route = (e.currentTarget as HTMLElement).dataset.navigate;
						if (route) {
							navigateTo(route);
						}
					});
				});

				try {
					await authenticatedFetch('/api/updateInfos');
					updateUserProfile();
					updateUserProfilePong();
				} catch {
					// console.log('Not authenticated, skipping profile update');
				}
			}, 100);
			break;
		case '/updateInfos':
			initThemeToggle();
			await displayDarkModeButton();
			initLanguageSelector();
			await updateInfos();

			setTimeout(() => {
				document.querySelector('[data-navigate="/dashboard"]')?.addEventListener('click', e => {
					e.preventDefault();
					navigateTo('/dashboard');
				});
			}, 100);
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
			initLanguageSelector();
			await displayDarkModeButton();
			break;
		case '/pong/matchmaking/game':
			await pongGame();
			break;
		case '/pong/matchmaking/localgame':
			localpongGame();
			break;
		case '/snake':
			await snakeGame();
			setTimeout(() => {
				document.querySelector('[data-navigate="/dashboard"]')?.addEventListener('click', e => {
					e.preventDefault();
					navigateTo('/dashboard');
				});
			}, 100);
			break;
		case '/snake/local':
			await displayDarkModeButton();
			localSnakeGame();
			break;
		case '/2fa-verification':
			initTwoFALogin();
			break;
		case '/statisticsSnake':
			setTimeout(async () => {
				initThemeToggle();
				await displayDarkModeButton();
				initSnakeStats();
				updateRanking();
				languageManager.updatePageTranslations();

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
						// console.log('Not authenticated, skipping profile update');
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
				// console.log('About to call initPongStats');
				initThemeToggle();
				await displayDarkModeButton();
				initPongStats();
				updateRankingPong();
				languageManager.updatePageTranslations();

				// Même logique que Snake : ne pas appeler updateInfos/initProfilePage si on regarde un autre utilisateur
				const urlParams = new URLSearchParams(window.location.search);
				const targetUserId = urlParams.get('user');

				if (!targetUserId) {
					// Seulement pour nos propres stats
					updateInfos();
					initProfilePage();
					try {
						await authenticatedFetch('/api/updateInfos');
						updateUserProfilePong();
					} catch {
						// console.log('Not authenticated, skipping profile update');
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
			break;
		case '/pong-choice':
			languageManager.updatePageTranslations();
			break;
		case '/snake-choice':
			languageManager.updatePageTranslations();
			break;
	}
}

// Ajoute ces variables en haut du fichier (scope module)
let navigating = false;
let favLangChecked = false;

// Optionnel: mini-registry de nettoyages par route
let routeCleanupFns: Array<() => void> = [];
export function registerRouteCleanup(fn: () => void) {
	routeCleanupFns.push(fn);
}
function runRouteCleanup() {
	for (const fn of routeCleanupFns) {
		try {
			fn();
		} catch {}
	}
	routeCleanupFns = [];
}

export async function navigateTo(url: string) {
	// Évite les navigations concurrentes
	// disconnectSocket();
	disconnectSocket();
	disconnectSocketSnake();
	abortUIListenersSnake();
	abortUIListeners();
	if (navigating) return;

	const newPath = new URL(url, window.location.origin).pathname;
	// Pas de re-render si on est déjà sur la même route
	if (window.location.pathname === newPath) return;

	navigating = true;

	// Nettoyage global avant de changer de page
	runRouteCleanup();
	cleanupScrollAnimations();
	cleanupThemeToggle();

	history.pushState(null, '', url);
	await renderPage();

	navigating = false;
}

document.addEventListener('DOMContentLoaded', async () => {
	await initializeLanguage();
	updateUserProfile();
	updateUserProfilePong();

	document.body.addEventListener('click', async e => {
		const anchor = (e.target as HTMLElement).closest('a[href]');
		if (!anchor) return;

		const href = anchor.getAttribute('href') || '';
		// N'intercepte que les routes internes du SPA
		if (!href.startsWith('/')) return;

		const me = e as MouseEvent;
		const isLeftClick = me.button === 0;
		const isModifiedClick = me.metaKey || me.ctrlKey || me.shiftKey || me.altKey;
		const targetAttr = anchor.getAttribute('target');
		const hasTarget = !!targetAttr && targetAttr !== '_self';
		const isDownload = anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external';

		if (!isLeftClick || isModifiedClick || hasTarget || isDownload) return;

		// Évite le re-render si même route
		const newPath = new URL(href, window.location.origin).pathname;
		if (window.location.pathname === newPath) return;

		e.preventDefault();
		await navigateTo(href);
	});

	window.addEventListener('popstate', () => {
		disconnectSocket();
		disconnectSocketSnake();
		abortUIListenersSnake();
		abortUIListeners();
		// Nettoie aussi quand on revient en arrière
		runRouteCleanup();
		renderPage();
	});

	await renderPage();
});
