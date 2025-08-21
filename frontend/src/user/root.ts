//import { navigateTo } from './main';
import { delogUser } from './logout';
import { displayLogout } from '../utils/userInfo';

export async function rootUser() {
	const button = document.getElementById('logout') as HTMLElement | null;
	if (!button) return true;

	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;
	const response = await fetch(`${protocol}//${host}:${port}/api/`, {
		method: 'GET',
	});
	const reply = await response.json();
	if (reply.success) {
		displayLogout();
		delogUser();
	}
}
