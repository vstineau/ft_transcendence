import { navigateTo } from './main.js';

export async function logUser() {
	const form = document.getElementById('login-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		const test = new FormData(form);
		const login = test.get('login');
		const lastname = test.get('login');
		const password = test.get('password');
		const nickname = test.get('nickname');
		const email = test.get('email');
		const body = {
			login: login,
			nickName: nickname,
			password: password,
			email: email,
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
		 console.log(test.get('login'));
		 console.log(test.get('email'));
		 navigateTo('/');
		 } catch (err) {
		 console.error('error = ', err);
		 }
		 navigateTo('/');
		 console.log();
	});
}
