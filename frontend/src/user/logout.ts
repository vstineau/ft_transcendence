import { navigateTo } from '../main';
import { displayError } from '../utils/error'

export async function delogUser() {
	const button = document.getElementById('logout') as HTMLFormElement | null;
	if (!button) return true;
	button?.addEventListener('click', async e => {
		e.preventDefault();
		try {
		const response = await fetch('https://localhost:8080/api/logout', {
		 	method: 'GET',
		 	headers: {
		 	},
			credentials: 'include',
			 });
		const data = await response.json();
		      if (data.success) {
		        navigateTo('/');
		      } else {
		        displayError(data.error || "Erreur inconnue");
		   }
		 }
		 catch (err) {
		 console.error('error = ', err);
		 }
	});
}
