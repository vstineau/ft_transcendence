// import {
//   LoginView,
//   PongView,
//   RegisterView,
//   RootView,
// } from "./views/root.views.js";
import { navigateTo } from './main.js';

// interface User {
// 	login: string;
// 	password: string;
// 	email: string;
// }

// const form = document.getElementById('register-form') as HTMLFormElement;

// form.addEventListener('submit', async event => {
// 	event.preventDefault();

// 	const login = (document.getElementById('login') as HTMLFormElement).value;
// 	const mail = (document.getElementById('mail') as HTMLFormElement).value;
// 	const password = (document.getElementById('password') as HTMLFormElement).value;

// 	console.log(login);
// 	console.log(mail);
// 	console.log(password);
// });

export async function registerUser() {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		const test = new FormData(form);
		const login = test.get('login');
		const email = test.get('email');
		const password = test.get('password');
		const body = {
			login: login,
			email: email,
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
		if (!response) {
			// error handle = staying on register page
			navigateTo('/register');
			return;
		}
		JSON.parse;
		console.log(test.get('login'));
		console.log(test.get('email'));
		console.log(test.get('password'));
		navigateTo('/');
		// } catch (err) {
		// console.error('error = ', err);
		// }
		// navigateTo('/');
		// console.log();
	});
}
