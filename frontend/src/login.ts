import { navigateTo } from './main.js';

export async function logUser() {
	const form = document.getElementById('login-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		const test = new FormData(form);
		const login = test.get('login');
		const password = test.get('password');
		console.log(login);
		console.log(password);
		const body = {
			login: login,
			password: password,
		};
		// sending token to backend then wait response
		// try {
		const response = 1; //= await fetch('http://localhost:3000/register', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify(body),
		// });
		// if (response) {
		// 	// error handle = staying on register page
		// 	// navigateTo('/login');
		// 	return;
		// }
		// JSON.parse;
		// console.log(test.get('login'));
		// console.log(test.get('email'));
		// navigateTo('/');
		// } catch (err) {
		// console.error('error = ', err);
		// }
		// navigateTo('/');
		// console.log();
	});
}
