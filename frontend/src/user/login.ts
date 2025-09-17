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

        // console.log('=== LOGIN DEBUG ===');
        // console.log('Login data being sent:', { login, password });

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

            // console.log('Response status:', response.status);
            // console.log('Response ok:', response.ok);

            // if (!response.ok) {
            //     const errorText = await response.text();
            //     console.log('Login error response:', errorText);
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }

            const result = await response.json(); // Une seule fois
            // console.log('Login response:', result);

            if (result.success) {
				// console.log('=== SUCCESS BRANCH ===');
				// console.log('result.twoFaAuth:', result.twoFaAuth);
				// console.log('result.tmpToken:', result.tmpToken);
                const queryString = !window.location.search ? '/dashboard' : window.location.search.substring(1);

                if (result.user) {
                    saveUserData(result.user);
                }
                // if (result.twoFaAuth) {
                //     navigateTo('/2fa-verification');
                // }
				if (result.twoFaAuth) {
					// console.log('=== 2FA BRANCH ===');
					if (result.tmpToken) sessionStorage.setItem('twofa_tmp_token', result.tmpToken);
					sessionStorage.setItem('login', login); // Ajoutez cette ligne
					// console.log('About to navigate to /2fa-verification');
					navigateTo('/2fa-verification');
					return;
				}
				else {
                    navigateTo(queryString);
                }
            } else {
                displayError(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.log('Login error:', error);
            displayError('Connection error. Please try again.');
        }
    });
}

function saveUserData(userData: any): void {
	try {
		localStorage.setItem('currentUser', JSON.stringify(userData));
		// console.log('USer data saved:', userData);
	} catch (error) {
		console.log('Error saving user data:', error);
	}
}

export function initTwoFALogin() {
	// console.log('=== TEST ===');
    const form = document.getElementById('twofa-form') as HTMLFormElement | null;
    const errorEl = document.getElementById('twofa-error') as HTMLElement | null;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = (document.getElementById('twofa-code') as HTMLInputElement).value.trim();
        if (token.length !== 6) {
            if (errorEl) {
                errorEl.textContent = 'Enter the 6-digit code';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        try {
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;

            // Récupère le tmpToken stocké lors du login
            const tmpToken = sessionStorage.getItem('twofa_tmp_token');

			// console.log('=== 2FA DEBUG ===');
            // console.log('tmpToken from storage:', tmpToken);
            // console.log('token from form:', token);
            // console.log('URL:', `${protocol}//${host}:${port}/api/login2fa`);

            if (!tmpToken) {
                if (errorEl) {
                    errorEl.textContent = 'Session expired. Please login again.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }
			const res = await fetch(`${protocol}//${host}:${port}/api/login2fa`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				token,           // Code 2FA du formulaire
				login: sessionStorage.getItem('login'), // Login stocké
				tmpToken         // Token temporaire
			}),
		});

			//  console.log('Response status:', res.status);
            // console.log('Response ok:', res.ok);

            const data = await res.json();
			// console.log('Response data:', data);
            if (!data.success) {
                if (errorEl) {
                    errorEl.textContent = data.error || 'Invalid code';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            sessionStorage.removeItem('twofa_tmp_token');
            navigateTo('/dashboard');
        } catch {
            if (errorEl) {
                errorEl.textContent = 'Network error';
                errorEl.classList.remove('hidden');
            }
        }
    });
}

export async function TwoFAVerifyView() {
    return `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
            <h2 class="text-2xl font-semibold text-center text-black mb-8">Two-Factor Authentication</h2>
            <form id="twofa-form" class="space-y-4">
                <input type="text" inputmode="numeric" maxlength="6" id="twofa-code"
                    placeholder="Enter 6-digit code"
                    class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none bg-transparent" required />
                <div class="flex justify-center pt-4">
                    <button type="submit" class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg">
                        Verify
                    </button>
                </div>
            </form>
            <p id="twofa-error" class="text-sm text-red-600 mt-3 hidden"></p>
        </div>
    </div>
    `;
}
