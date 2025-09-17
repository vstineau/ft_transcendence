import { navigateTo } from '../main';
import { displayError } from '../utils/error';
import { hideChatButton } from '../utils/chat_tools';

export async function delogUser() {
	const button = document.getElementById('logout') as HTMLFormElement | null;
	if (!button) return true;
	button?.addEventListener('click', async e => {
		e.preventDefault();
		try {
			const host = window.location.hostname;
			const port = window.location.port;
			const protocol = window.location.protocol;
			const response = await fetch(`${protocol}//${host}:${port}/api/logout`, {
				method: 'GET',
				headers: {},
				credentials: 'include',
			});
			const data = await response.json();
			if (data.success) {
				// Masquer le bouton chat après déconnexion
				hideChatButton();
				navigateTo('/');
			} else {
				displayError(data.error || 'Erreur inconnue');
			}
		} catch (err) {
			console.log('error = ', err);
		}
	});
}
