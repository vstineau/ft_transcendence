import { navigateTo } from '../main';
import { displayError } from '../utils/error';
import { displayChatButton } from '../utils/chat_tools';


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
				// Afficher le bouton chat après connexion réussie
				await displayChatButton();
				// Afficher le bouton chat après connexion réussie
				await displayChatButton();
				navigateTo('/');
			} else {
				displayError(data.error || 'Erreur inconnue');
			}
		} catch (err) {
			console.error('error = ', err);
		}
	});
}

function saveUserData(userData: any): void {
	try{
		localStorage.setItem('currentUser', JSON.stringify(userData));
		console.log('USer data saved:', userData);
	}catch (error){
		console.error('Error saving user data:', error);
	}
}
