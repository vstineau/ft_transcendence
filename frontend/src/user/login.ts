import { navigateTo } from '../main';
import { displayError } from '../utils/error';
import { displayChatButton } from '../utils/chat_tools';


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
		try {
			const host = window.location.hostname;
			const port = window.location.port;
			const protocol = window.location.protocol;
			const response = await fetch(`${protocol}//${host}:${port}/api/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				credentials: 'include',
			});
			const data = await response.json();
			if (data.success && data.twoFaAuth) {
				//afficher une form pour recuperer le code qui a ete generer sur l'appli google authentificator
			}
			if (data.success) {
				// Afficher le bouton chat après connexion réussie
				await displayChatButton();
				navigateTo('/');
			} else {
				displayError(data.error || 'Erreur inconnue');
			}
		} catch (err) {
			console.error('error = ', err);
		}
	});
    const form = document.getElementById('login-form') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        displayError('');

        const formData = new FormData(form);
        const login = formData.get('login')?.toString().trim();
        const password = formData.get('password')?.toString().trim();

        if (!login || !password) {
            displayError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('https://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: login, // Si le backend attend 'login' au lieu d'email
                    password: password
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Login response:', result); // Pour debug

            if (result.success) {
                // Sauvegarder les données utilisateur
                if (result.user) {
                    saveUserData(result.user);
                }
                // Vérifier si 2FA est nécessaire
                if (result.twoFaAuth) {
                    navigateTo('/2fa-verification');
                } else {
                    // Connexion réussie, aller au dashboard
                    navigateTo('/dashboard');
                }
            } else {
                displayError(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayError('Connection error. Please try again.');
        }
    });
}

function saveUserData(userData: any): void {
	try{
		localStorage.setItem('currentUser', JSON.stringify(userData));
		console.log('USer data saved:', userData);
	}catch (error){
		console.error('Error saving user data:', error);
	}
}
