
import { navigateTo } from '../main';

export async function loginGithub() {
	try {
	const host = window.location.hostname;
	const port = window.location.port;
	const protocol = window.location.protocol;
	await fetch(`${protocol}//${host}:${port}/api/login/github/callback`);
	navigateTo('/');
	} catch (error) {}
}

export async function loginGithub2() {
}
