// import {
//   LoginView,
//   PongView,
//   RegisterView,
//   RootView,
// } from "./views/root.views.js";
import { navigateTo } from './main';

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
		 	navigateTo('/login');
		 	return;
		 }
		//JSON.parse;
		navigateTo('/');
		} catch (err) {
		navigateTo('/');
		console.error('error = ', err);
		}
	});
}
