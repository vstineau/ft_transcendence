import { navigateTo } from '../main';
import { displayError } from '../utils/error';

export async function logUser() {
	const form = document.getElementById('login-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		const test = new FormData(form);
		const login = test.get('login');
		const password = test.get('password');
		const body = {
			login: login,
			password: password,
		};
		try {
			// const queryString = window.location;
			const queryString = !window.location.search ? '/' : window.location.search.substring(1);
			console.log("querystring = " + queryString);
			const host = window.location.hostname; 
			const port = window.location.port;
			const protocol = window.location.protocol;
			const response = await fetch(`${protocol}//${host}:${port}/api/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				credentials: 'include',
			});
			const data = await response.json();
			if (data.success && data.twoFaAuth) {
				//afficher une form pour recuperer le code qui a ete generer sur l'appli google authentificator
			}
			if (data.success) {
				navigateTo(queryString);
			} else {
				displayError(data.error || 'Erreur inconnue');
			}
		} catch (err) {
			console.error('error = ', err);
		}
	});
}
