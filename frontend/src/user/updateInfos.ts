import { navigateTo } from '../main';
import { displayError } from '../utils/error'

export async function updateInfos() {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;
	try {
		const response = await fetch('https://localhost:8080/api/updateInfos', {
			method: 'GET',
		});
		const reply = await response.json();
		const loginInput = document.getElementById('login') as HTMLInputElement | null;
		const nicknameInput = document.getElementById('nickname') as HTMLInputElement | null;
		const mailInput = document.getElementById('mail') as HTMLInputElement | null;
		loginInput ? loginInput.placeholder = reply.user.login : "";
		nicknameInput ? nicknameInput.placeholder = reply.user.nickName : "";
	    mailInput ? mailInput.placeholder = reply.user.email : "";}
	catch (err ){}
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		displayError('');
		const newform = new FormData(form);
		const login = newform.get('login')?.toString().trim(); //toSring to prevent if someone try to input an object and trim to remove whitespaces at the end/begining
		const password = newform.get('password')?.toString().trim();
		const newPassword = newform.get('newPassword')?.toString().trim();
		const nickname = newform.get('nickname')?.toString().trim();
		const email = newform.get('email')?.toString().trim();

		const body = {
			login: login,
			nickName: nickname,
			password: password,
			newPassword: newPassword,
			email: email,
		};
		// sending token to backend then wait response
		try {
		const response = await fetch('https://localhost:8080/api/updateInfos', {
		 	method: 'POST',
		 	headers: {
		 		'Content-Type': 'application/json',
		 	},
		 	body: JSON.stringify(body),
		 });
		 const reply = await response.json();
		 console.log(reply);
		 if (reply.success) {
		 	navigateTo('/');
		 }
		 else {
			displayError(reply.error || "registration failed please try again");
		}
		} catch (err) {
			console.log(err);
		}
	});
}
