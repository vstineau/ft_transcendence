import { navigateTo } from '../main';
import { displayError } from '../utils/error'
import { readFileAsBase64 } from '../utils/userInfo'

export async function registerUser() {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		displayError('');
		const newform = new FormData(form);
		const login = newform.get('login')?.toString().trim(); //toSring to prevent if someone try to input an object and trim to remove whitespaces at the end/begining
		const password = newform.get('password')?.toString().trim();
		const nickname = newform.get('nickname')?.toString().trim();
		const email = newform.get('email')?.toString().trim();
		const file_input = document.getElementById('avatar') as HTMLInputElement | null;
		const file = file_input?.files?.[0];
	
		const body = {
			login: login,
			nickName: nickname,
			password: password,
			email: email,
			avatar: ''
		};

		if (file) {
			try {
				const base64 = await readFileAsBase64(file);
				body.avatar = base64;
			} catch (err) {
				displayError('error with avatar');
			}
		}
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
