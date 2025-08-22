import { navigateTo } from '../main';
import { displayError } from '../utils/error'


export async function logUser() {
    const form = document.getElementById('login-form') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        displayError('');

        const formData = new FormData(form);
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString().trim();

        if (!email || !password) {
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
                    email: email, // Si le backend attend 'login' au lieu d'email
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
