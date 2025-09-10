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
import { initLanguageSelector, initializeLanguage } from './lang/languageManager';


// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': WelcomeView,
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
	'/statisticsPong': StatsPongView,
	'/statisticsSnake': StatsSnakeView,
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
	if (!publicPaths.includes(path)) {
		try {
			await authenticatedFetch('/api/updateInfos');
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
			//displayChatButton(); // Affichage debbug.
			setTimeout(() => {
				initScrollAnimations();
				initThemeToggle();
				initLanguageSelector();
			}, 100);
			break;
		case '/dashboard':
			rootUser();
			displayChatButton();
			setTimeout(() => {
				initThemeToggle();
				initProfilePage();
				updateRecentContacts();
				initLanguageSelector();
			}, 100);
			break;
		case '/updateInfos':
			initThemeToggle();
			displayDarkModeButton();
			initLanguageSelector();
			updateInfos();
			displayChatButton();
			break;
		case '/register':
			initThemeToggle();
			displayDarkModeButton();
			initLanguageSelector();
			registerUser();
			break;
		case '/login':
			initThemeToggle();
			displayDarkModeButton();
			initLanguageSelector();
			logUser();
			break;
		case '/pong/matchmaking/game':
			await pongGame();
			await displayChatButton();
			break;
		case '/pong/matchmaking/localgame':
			localpongGame();
			displayChatButton();
			break;
		case '/snake':
			await snakeGame();
			break;
		case '/snake/local':
			displayDarkModeButton();
			localSnakeGame();
			displayChatButton();
			break;
		case '/2fa-verification':
			initTwoFALogin();
			break;
		case '/statisticsSnake':
			setTimeout(() => {
				console.log('About to call initSnakeStats');
				initThemeToggle();
				displayDarkModeButton();
				initSnakeStats();
				updateRanking();
				updateInfos();
				initProfilePage();
			}, 100);
			break;
		case '/statisticsPong':
			setTimeout(() => {
				console.log('About to call initPongStats');
				initThemeToggle();
				displayDarkModeButton();
				initPongStats();
				updateRankingPong();
				updateInfos();
				initProfilePage();
			}, 100);
			break;
		case '/pong/tournament':
			pongTournament();
			displayChatButton();
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
