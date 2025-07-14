import { navigateTo } from './main';

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
		const response = await fetch('https://localhost:8080/api/login', {
		 	method: 'POST',
		 	headers: {
		 		'Content-Type': 'application/json',
		 	},
		 	body: JSON.stringify(body),
		 });
		 if (response) {
				const data =  await response.json();
				//console.log(response);
				const token = data.token
				if(token){
					localStorage.setItem('token', token)
					console.log('token :', token)
				}
				console.log('aaaaaaaaaaaaa');
				console.log(data);
				console.log(JSON.stringify(data))
		 	// error handle = staying on register page
		 	// navigateTo('/login');
			navigateTo('/');
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
