import { navigateTo } from './main.js';

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
		// sending token to backend then wait response
		try {
		const response = await fetch('https://localhost:8080/api/register', {
		 	method: 'POST',
		 	headers: {
		 		'Content-Type': 'application/json',
		 	},
		 	body: JSON.stringify(body),
		 });
		 if (response) {
		 	// error handle = staying on register page
		 	// navigateTo('/login');
		 	return;
		 }
		 //JSON.parse;
		 navigateTo('/');
		 } catch (err) {
		 console.error('error = ', err);
		 }
		 navigateTo('/');
		 console.log();
	});
}
