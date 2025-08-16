// import { register } from 'ts-node';
import { registerUser } from './user/register';
import { logUser } from './user/login';
import { rootUser } from './user/root';
import { updateInfos } from './user/updateInfos';
import {
	LoginView,
	PongView,
	RegisterView,
	UpdateInfosview,
	RootView,
	PongMatchMakingView,
	PongCanvas,
	localPongCanvas,
	SnakeCanvas,
	localSnakeCanvas,
	WelcomeView,
} from './views/root.views';
import { pongGame } from './pong/pong';
import { initScrollAnimations, cleanupScrollAnimations } from './utils/animations';
import { initThemeToggle, cleanupThemeToggle } from './theme/darkMode';
import { snakeGame } from './snake/snake';
import { localSnakeGame } from './snake/localSnake';
import { localpongGame } from './pong/localPong';

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': WelcomeView,
	'/dashboard': RootView,
	'/pong': PongView,
	'/pong/matchmaking': PongMatchMakingView,
	'/pong/matchmaking/game': PongCanvas,
	'/pong/matchmaking/localgame': localPongCanvas,
	'/pong/leaderboard': async () => '<h1>leaderboard</h1>',
	'/pong/stats': async () => '<h1>stats</h1>',
	'/pong/tournament': async () => '<h1>tournament</h1>',
	'/login': LoginView,
	'/logout': async () => '<h1>LOGOUT</h1>',
	'/snake': SnakeCanvas,
	'/snake/local': localSnakeCanvas,
	'/register': RegisterView,
	'/updateInfos': UpdateInfosview,
};

export async function navigateTo(url: string) {
	// Nettoyer les animations de la page précédente
	cleanupScrollAnimations();
	cleanupThemeToggle();

	history.pushState(null, '', url);
	await renderPage();
}

async function renderPage() {
	const path = window.location.pathname;
	console.log(path);

	cleanupScrollAnimations();
    cleanupThemeToggle();

	const view = routes[path] ? await routes[path]() : '<h1>404 Not Found</h1>';
	const rootElement: HTMLElement | null = document.getElementById('root');

	// document.getElementById('root')!.innerHTML = view;

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
			}, 100);
			break;
		case '/dashboard':
			rootUser();
			setTimeout(() => {
				initThemeToggle(); // ← Initialiser le thème après les animations
			}, 100);
			break;
		case '/updateInfos':
			updateInfos();
			break;
		case '/register':
			registerUser();
			break;
		case '/login':
			logUser();
			break;
		case '/pong/matchmaking/game':
			pongGame();
			break;
		case '/pong/matchmaking/localgame':
			localpongGame();
			break;
		case '/snake':
			snakeGame();
			break;
		case '/snake/local':
			localSnakeGame();
			break;
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	document.body.addEventListener('click', async e => {
		const target = e.target as HTMLElement;
		// if (target instanceof HTMLAnchorElement)
		if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('/')) {
			e.preventDefault();
			await navigateTo((target as HTMLAnchorElement).getAttribute('href')!);
		}
	});

	// 5. Gère le bouton "Retour" du navigateur
	window.addEventListener('popstate', renderPage);

	// 6. Rendu initial
	await renderPage();
	// pongGame();
});
