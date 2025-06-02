import {
  LoginView,
  PongView,
  RegisterView,
  RootView,
} from "./views/root.views.js";

interface User {
	login: string
	password: string
	email: string
}

const form = document.getElementById('register-form') as HTMLFormElement

form.addEventListener('submit', async (event) => {
	event.preventDefault();

	const login = (document.getElementById('login') as HTMLFormElement).value
	const mail = (document.getElementById('mail') as HTMLFormElement).value
	const password = (document.getElementById('password') as HTMLFormElement).value

	console.log(login)
	console.log(mail)
	console.log(password)
})