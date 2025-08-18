import { navigateTo } from '../main';
import { displayError } from '../utils/error'
import { readFileAsBase64 } from '../utils/userInfo'
import { initUserAvatar } from '../utils/avatar';

export async function updateInfos() {

	initUserAvatar();
	
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;

	let state: boolean = false;
	const noAvatar = document.getElementById('defaultAvatars') as HTMLElement | null;
	if (noAvatar) {
		noAvatar.addEventListener('click', (e) => {
			e.preventDefault(); // Pour éviter tout comportement natif éventuel
			state = !state;
			if (noAvatar.classList.contains('bg-purple-600')) {
				noAvatar.classList.remove('bg-purple-600');
				noAvatar.classList.add('bg-green-600');
			} else {
				noAvatar.classList.remove('bg-green-600');
				noAvatar.classList.add('bg-purple-600');
			}
		});
	}

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
		const file_input = document.getElementById('avatar') as HTMLInputElement | null;
		const file = file_input?.files?.[0];
		const body = {
			login: login,
			nickName: nickname,
			password: password,
			newPassword: newPassword,
			email: email,
			avatar: '',
			noAvatar: state,
			ext: '',
		};
		if (file) {
			try {
				const base64 = await readFileAsBase64(file);
				body.avatar = base64;
				const fileName = file.name;
				const lastDot = fileName.lastIndexOf('.');
				if (lastDot !== -1) {
					body.ext = fileName.slice(lastDot + 1).toLowerCase();
				}
			} catch (err) {
				displayError('error with avatar');
			}
		}
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
