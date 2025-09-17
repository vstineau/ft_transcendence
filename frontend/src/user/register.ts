import { navigateTo } from '../main';
import { displayError } from '../utils/error';
import { readFileAsBase64 } from '../utils/userInfo';

export function showQRCodeModal(qrCodeDataURL: string): void {
	// Créer la modale
	const modal = document.createElement('div');
	modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
	modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <h3 class="text-2xl font-bold mb-4">Configuration 2FA</h3>
            <p class="text-gray-600 mb-6">
                Scannez ce QR code avec votre application d'authentification
                (Google Authenticator, Authy, etc.)
            </p>

            <!-- QR Code -->
            <div class="flex justify-center mb-6">
                <img src="${qrCodeDataURL}" alt="QR Code 2FA" class="w-48 h-48 border rounded-lg">
            </div>

            <div class="space-y-3">
                <button
                    id="qr-done-btn"
                    class="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    J'ai scanné le QR code
                </button>

                <p class="text-xs text-gray-500">
                    Gardez votre application d'authentification à portée de main pour vos futures connexions.
                </p>
            </div>
        </div>
    `;

	// Ajouter au DOM
	document.body.appendChild(modal);

	// Gestion du bouton "Terminé"
	const doneBtn = modal.querySelector('#qr-done-btn') as HTMLButtonElement;
	doneBtn?.addEventListener('click', () => {
		document.body.removeChild(modal);
		navigateTo('/login');
	});

	// Fermer en cliquant à l'extérieur
	modal.addEventListener('click', e => {
		if (e.target === modal) {
			document.body.removeChild(modal);
			navigateTo('/login');
		}
	});
}

export async function registerUser() {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		displayError('');

		const newform = new FormData(form);
		const login = newform.get('login')?.toString().trim(); //toSring to prevent if someone try to input an object and trim to remove whitespaces at the end/begining
		const password = newform.get('password')?.toString().trim();
		const nickname = newform.get('nickname')?.toString().trim();
		const email = newform.get('email')?.toString().trim();
		const file_input = document.getElementById('avatar') as HTMLInputElement | null;

		//correction 2fa
		const twoFaAuth = document.getElementById('enable2fa') as HTMLInputElement;
		const file = file_input?.files?.[0];

		const body = {
			login: login,
			nickName: nickname,
			password: password,
			email: email,
			avatar: '',
			twoFaAuth: twoFaAuth?.checked || false,
		};

		if (file) {
			try {
				const base64 = await readFileAsBase64(file);
				body.avatar = base64;
			} catch (err) {
				displayError('error with avatar');
			}
		}
		// sending token to backend then wait response
		try {
			const queryString = !window.location.search ? '/login' : window.location.search.substring(1);
			const host = window.location.hostname;
			const port = window.location.port;
			const protocol = window.location.protocol;
			const response = await fetch(`${protocol}//${host}:${port}/api/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const reply = await response.json();

			if (reply.success) {
				if (reply.qrCode && twoFaAuth?.checked) {
					showQRCodeModal(reply.qrCode);
				} else {
					navigateTo(queryString);
				}
			} else {
				displayError(reply.error || 'registration failed please try again');
			}
			//JSON.parse;
		} catch (err) {
			// console.log(err);
			navigateTo('/');
		}
	});
}
