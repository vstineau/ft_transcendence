// import { register } from 'ts-node';
import { registerUser } from './register.js';
import { logUser } from './login.js';
import { LoginView, PongView, RegisterView, RootView } from './views/root.views.js';

// 1. Déclaration des routes
const routes: { [key: string]: () => Promise<string> } = {
	'/': RootView,
	//"/": async () => "<h1>AAAAAAAAAAAAAA</h1>",
	'/pong': PongView, // Remplace par le vrai contenu ou composant
	'/login': LoginView,
	'/logout': async () => '<h1>LOGOUT</h1>',
	'/register': RegisterView,
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
	if (path === '/register') registerUser();
	if (path === '/login') logUser();

}

// async function registerUser(){
// 	const form = document.getElementById('register-form') as HTMLFormElement;
// 	form.addEventListener('submit', async e => {
// 		e.preventDefault();
// 		const test = new FormData(form);
// 		const login = test.get('login');
// 		const email = test.get('email');
// 		const password = test.get('password');
// 		const body = {
// 			login: login,
// 			email: email,
// 			password: password,
// 		};
// 		const response = await fetch('http://localhost:3000/register', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify(body),
// 		});
// 		if (!response.ok) {
// 		}
// 		console.log(test.get('login'));
// 		console.log(test.get('email'));
// 		console.log(test.get('password'));
// 		// navigateTo('/');
// 		// console.log();
// 	});
// }
// 4. Interception des liens (SPA navigation)
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
});
