// import { register } from 'ts-node';
import { registerUser } from './register';
import { logUser } from './login';
import { LoginView, PongView, RegisterView, RootView, PongMatchMakingView, PongCanvas } from './views/root.views';
import { pongGame } from './pong/pong';

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': RootView,
	//"/": async () => "<h1>AAAAAAAAAAAAAA</h1>",
	'/pong': PongView, // Remplace par le vrai contenu ou composant
	'/pong/matchmaking': PongMatchMakingView,
	'/pong/matchmaking/game': PongCanvas,
	'/pong/leaderboard': async () => '<h1>leaderboard</h1>',
	'/pong/stats': async () => '<h1>stats</h1>',
	'/pong/tournament': async () => '<h1>tournament</h1>',
	'/login': LoginView,
	'/logout': async () => '<h1>LOGOUT</h1>',
	'/register': RegisterView,
	// '/pong/': RegisterView,
};

// 2. Fonction pour naviguer
export async function navigateTo(url: string) {
	history.pushState(null, '', url);
	await renderPage();
}

// 3. Rendu de la page selon l’URL courante
async function renderPage() {
	const path = window.location.pathname;
	const view = routes[path] ? await routes[path]() : '<h1>404 Not Found</h1>';
	console.log(view);
	document.getElementById('root')!.innerHTML = view;
	console.log(path);
	if (path === '/register') {
		registerUser();
	}
	if (path === '/login') {
		logUser();
	}
	if (path === '/pong/matchmaking/game') {
		pongGame();
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	document.body.addEventListener('click', async e => {
		const target = e.target as HTMLElement;
		if (target instanceof HTMLAnchorElement) {
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
