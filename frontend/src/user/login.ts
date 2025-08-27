import { navigateTo } from '../main';
import { displayError } from '../utils/error';

export async function logUser() {
    const form = document.getElementById('login-form') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        displayError('');

        const formData = new FormData(form);
        const login = formData.get('login')?.toString().trim();
        const password = formData.get('password')?.toString().trim();

        if (!login || !password) {
            displayError('Please fill in all fields');
            return;
        }

        console.log('=== LOGIN DEBUG ===');
        console.log('Login data being sent:', { login, password });

        try {
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;

            const response = await fetch(`${protocol}//${host}:${port}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Login error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json(); // Une seule fois
            console.log('Login response:', result);

            if (result.success) {
                const queryString = !window.location.search ? '/dashboard' : window.location.search.substring(1);

                // if (result.user) {
                //     saveUserData(result.user);
                // }
                // if (result.twoFaAuth) {
                //     navigateTo('/2fa-verification');
                // } else {
                //     navigateTo(queryString);
                // }
                if (result.success) {
                    if (result.twoFaAuth) {
                        // le back doit renvoyer un tmpToken (ou equivalent)
                        if (result.tmpToken) sessionStorage.setItem('twofa_tmp_token', result.tmpToken);
                        navigateTo('/2fa-verification');
                        return;
                    }
                    // sinon login complet
                    if (result.user) saveUserData(result.user);
                    navigateTo('/dashboard');
                    return;
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
	try {
		localStorage.setItem('currentUser', JSON.stringify(userData));
		console.log('USer data saved:', userData);
	} catch (error) {
		console.error('Error saving user data:', error);
	}
}

export function initTwoFALogin() {
  const form = document.getElementById('twofa-form') as HTMLFormElement | null;
  const errorEl = document.getElementById('twofa-error') as HTMLElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = (document.getElementById('twofa-code') as HTMLInputElement).value.trim();
    if (token.length !== 6) { if (errorEl) { errorEl.textContent = 'Enter the 6-digit code'; errorEl.classList.remove('hidden'); } return; }

    try {
      const host = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;

      // Récupère un tmpToken que ton back t’a donné après le login/password
      const tmpToken = sessionStorage.getItem('twofa_tmp_token'); // stocke-le au moment du login/password (voir ci-dessous)

      const res = await fetch(`${protocol}//${host}:${port}/api/login/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, tmpToken }),
      });
      const data = await res.json();
      if (!data.success) {
        if (errorEl) { errorEl.textContent = data.error || 'Invalid code'; errorEl.classList.remove('hidden'); }
        return;
      }
      sessionStorage.removeItem('twofa_tmp_token');
      navigateTo('/dashboard');
    } catch {
      if (errorEl) { errorEl.textContent = 'Network error'; errorEl.classList.remove('hidden'); }
    }
  });
}
