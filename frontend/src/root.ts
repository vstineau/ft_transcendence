//import { navigateTo } from './main';
import { delogUser } from './logout'
import { displayLogout } from './utils/userInfo'


export async function rootUser() {
	const button = document.getElementById('logout') as HTMLElement | null;
	if (!button) return true;
	const response = await fetch('https://localhost:8080/api/', {
		method: 'GET',
	});
	const reply = await response.json();
	if (reply.success) {
		displayLogout();		
		delogUser();
	}
}
