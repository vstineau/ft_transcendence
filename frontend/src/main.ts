// import { register } from 'ts-node';
import { registerUser } from './user/register';
import { logUser } from './user/login';
import { rootUser } from './user/root';
import { updateInfos } from './user/updateInfos'
import { LoginView, PongView, RegisterView, UpdateInfosview, RootView, PongMatchMakingView, PongCanvas } from './views/root.views';
import { pongGame } from './pong/pong';
import { initScrollAnimations, cleanupScrollAnimations } from './utils/animations';

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': RootView,
	'/pong': PongView, // Remplace par le vrai contenu ou composant
	'/pong/matchmaking': PongMatchMakingView,
	'/pong/matchmaking/game': PongCanvas,
	'/pong/leaderboard': async () => '<h1>leaderboard</h1>',
	'/pong/stats': async () => '<h1>stats</h1>',
	'/pong/tournament': async () => '<h1>tournament</h1>',
	'/login': LoginView,
	'/logout': async () => '<h1>LOGOUT</h1>',
	'/register': RegisterView,
	'/updateInfos': UpdateInfosview,
};

// 2. Fonction pour naviguer
// export async function navigateTo(url: string) {
// 	history.pushState(null, '', url);
// 	await renderPage();
// }
export async function navigateTo(url: string) {
	// Nettoyer les animations de la page précédente
	cleanupScrollAnimations();

	history.pushState(null, '', url);
	await renderPage();
}

// 3. Rendu de la page selon l’URL courante
// async function renderPage() {
// 	const path = window.location.pathname;
// 	const view = routes[path] ? await routes[path]() : '<h1>404 Not Found</h1>';
// 	console.log(view);
// 	document.getElementById('root')!.innerHTML = view;
// 	console.log(path);
// 	path === '/' ? rootUser() : 0;
// 	path === '/updateInfos' ? updateInfos() : 0;
// 	path === '/register' ? registerUser() : 0;
// 	path === '/login' ? logUser() : 0;
// 	path === '/pong/matchmaking/game' ? pongGame() : 0;
// }

async function renderPage() {
	const path = window.location.pathname;
	const view = routes[path] ? await routes[path]() : '<h1>404 Not Found</h1>';

	document.getElementById('root')!.innerHTML = view;

	// Initialiser les fonctionnalités spécifiques à chaque page
	switch(path) {
		case '/':
			rootUser();
			// Initialiser les animations de scroll seulement sur la page d'accueil
			setTimeout(() => initScrollAnimations(), 100);
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
