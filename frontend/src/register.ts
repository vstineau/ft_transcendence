import { navigateTo } from './main';
import { displayError } from './utils/error'

export async function registerUser() {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		displayError('');
		const test = new FormData(form);
		const login = test.get('login')?.toString().trim(); //toSring to prevent if someone try to input an object and trim to remove whitespaces at the end/begining
		const password = test.get('password')?.toString().trim();
		const nickname = test.get('nickname')?.toString().trim();
		const email = test.get('email')?.toString().trim();

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
		 const reply = await response.json();
		 if (reply.success) {
		 	navigateTo('/login');
		 }
		 else {
			displayError(reply.error || "registration failed please try again");
		}
		//JSON.parse;
		} catch (err) {
			console.log(err);
			navigateTo('/');
		}
	});
}
