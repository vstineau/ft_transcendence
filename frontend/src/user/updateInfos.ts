import { navigateTo } from '../main';
import { displayError } from '../utils/error';
import { readFileAsBase64 } from '../utils/userInfo';
import { fetchAndSaveUserInfo, initUserAvatar } from '../utils/avatar';

export async function updateInfos() {
	await fetchAndSaveUserInfo();

	setTimeout(() => {
		initUserAvatar();
		initUpdateInfosPage();
	}, 500);

	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;

	let state: boolean = false;
	const noAvatar = document.getElementById('defaultAvatars') as HTMLElement | null;
	if (noAvatar) {
		noAvatar.addEventListener('click', e => {
			e.preventDefault(); // Pour éviter tout comportement natif éventuel
			state = !state;
			if (noAvatar.classList.contains('bg-purple-600')) {
				noAvatar.classList.remove('bg-purple-600');
				noAvatar.classList.add('bg-green-600');
			} else {
				noAvatar.classList.remove('bg-green-600');
				noAvatar.classList.add('bg-purple-600');
			}
		});
	}

	try {
		const host = window.location.hostname;
		const port = window.location.port;
		const protocol = window.location.protocol;
		const response = await fetch(`${protocol}//${host}:${port}/api/updateInfos`, {
			method: 'GET',
		});
		const reply = await response.json();
		const loginInput = document.getElementById('login') as HTMLInputElement | null;
		const nicknameInput = document.getElementById('nickname') as HTMLInputElement | null;
		const mailInput = document.getElementById('mail') as HTMLInputElement | null;
		loginInput ? (loginInput.placeholder = reply.user.login) : '';
		nicknameInput ? (nicknameInput.placeholder = reply.user.nickName) : '';
		mailInput ? (mailInput.placeholder = reply.user.email) : '';
	} catch (err) {}
	form?.addEventListener('submit', async e => {
		e.preventDefault();
		displayError('');
		const newform = new FormData(form);
		const login = newform.get('login')?.toString().trim(); //toSring to prevent if someone try to input an object and trim to remove whitespaces at the end/begining
		const password = newform.get('password')?.toString().trim();
		const newPassword = newform.get('newPassword')?.toString().trim();
		const nickname = newform.get('nickname')?.toString().trim();
		const email = newform.get('email')?.toString().trim();
		const file_input = document.getElementById('avatar') as HTMLInputElement | null;
		const file = file_input?.files?.[0];
		const body = {
			login: login,
			nickName: nickname,
			password: password,
			newPassword: newPassword,
			email: email,
			avatar: '',
			noAvatar: state,
			ext: '',
		};
		if (file) {
			try {
				const base64 = await readFileAsBase64(file);
				body.avatar = base64;
				const fileName = file.name;
				const lastDot = fileName.lastIndexOf('.');
				if (lastDot !== -1) {
					body.ext = fileName.slice(lastDot + 1).toLowerCase();
				}
			} catch (err) {
				displayError('error with avatar');
			}
		}
		// sending token to backend then wait response
		try {
			const host = window.location.hostname;
			const port = window.location.port;
			const protocol = window.location.protocol;
			const response = await fetch(`${protocol}//${host}:${port}/api/updateInfos`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const reply = await response.json();
			console.log(reply);
			if (reply.success) {
				navigateTo('/');
			} else {
				displayError(reply.error || 'registration failed please try again');
			}
		} catch (err) {
			console.log(err);
		}
	});
}

function initUpdateInfosPage(): void {
	console.log('=== Initializing UpdateInfos page ===');

	// Initialiser l'avatar
	// initUserAvatar();

	// Initialiser les onglets
	initTabs();

	// Initialiser les menus
	initMenuItems();

	// Afficher le contenu par défaut
	showContent('change-password');
}

function initTabs(): void {
	const tabButtons = document.querySelectorAll('.tab-button');

	tabButtons.forEach(button => {
		button.addEventListener('click', () => {
			const tab = (button as HTMLElement).dataset.tab;
			if (tab) {
				switchTab(tab);
			}
		});
	});
}

function switchTab(tabName: string): void {
	console.log('Switching to tab:', tabName);

	// Mettre à jour les boutons d'onglets
	document.querySelectorAll('.tab-button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

	// Désactiver TOUS les menu items
	document.querySelectorAll('.menu-item').forEach(item => {
		item.classList.remove('active');
	});

	// Cacher tous les menus
	document.querySelectorAll('.tab-menu').forEach(menu => {
		menu.classList.add('hidden');
	});

	// CORRECTION : Gérer tous les onglets, pas seulement "profil"
	let targetMenuId = '';
	if (tabName === 'profil') {
		targetMenuId = 'profil-menu';
	} else if (tabName === 'general') {
		targetMenuId = 'general-menu';
	}

	const targetMenu = document.getElementById(targetMenuId);
	if (targetMenu) {
		targetMenu.classList.remove('hidden');

		// Activer le premier item du nouveau menu
		const firstMenuItem = targetMenu.querySelector('.menu-item');
		if (firstMenuItem) {
			firstMenuItem.classList.add('active');

			const contentKey = (firstMenuItem as HTMLElement).dataset.content;
			if (contentKey) {
				showContent(contentKey);
			}
		}
	}
}

function initMenuItems(): void {
	const menuItems = document.querySelectorAll('.menu-item');

	menuItems.forEach(item => {
		item.addEventListener('click', () => {
			const contentKey = (item as HTMLElement).dataset.content;
			if (contentKey) {
				// Désactiver tous les items du même menu
				const parentMenu = item.closest('.tab-menu');
				if (parentMenu) {
					parentMenu.querySelectorAll('.menu-item').forEach(menuItem => {
						menuItem.classList.remove('active');
					});
				}

				item.classList.add('active');
				showContent(contentKey);
			}
		});
	});
}

function showContent(contentKey: string): void {
	console.log('Showing content:', contentKey);

	const contentArea = document.getElementById('content-area');
	if (!contentArea) return;

	// Animation de sortie
	contentArea.style.opacity = '0';
	contentArea.style.transform = 'translateY(10px)';

	setTimeout(() => {
		contentArea.innerHTML = getContentHTML(contentKey);

		// Animation d'entrée
		contentArea.style.opacity = '1';
		contentArea.style.transform = 'translateY(0)';

		// Initialiser les fonctionnalités du contenu
		initContentFeatures(contentKey);
	}, 150);
}

function getContentHTML(contentKey: string): string {
	const contents: Record<string, string> = {
		'change-password': `
			<!--- ici les elements qui selon affiches selon l'onglet--->
			<form id="change-password-form" class="space-y-4">

				<!--email-->
				<input
				autocomplete="off"
				type="email"
				name="login"
				id="mail"
				placeholder="Email"
				class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
				required
				/>

				<!-- Mot de passe -->
				<input
				type="password"
				name="password"
				id="password"
				placeholder="Password"
				class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
				required
				/>

				<!-- nouveau mdp -->
				<input
				type="newpassword"
				name="newpassword"
				id="newpassword"
				placeholder="New password"
				class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
				required
				/>

				<!-- Bouton Submit-->
				<div class="flex justify-center pt-4">
				<button
				type="submit"
				class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-2 rounded-lg transition-colors"
				>Submit</button>
			</div>
		</form>
        `,

		'dual-authentication': `
            <div class="space-y-6">

                <div class="flex items-start">
                    <input type="checkbox" id="enable-2fa" class="w-5 h-5 mt-1 mr-4">
                    <div>
                        <h3 class="font-medium text-black text-medium mb-2">Turn on 2-Step Verification</h3>
                        <p class="text-sm text-gray-600 mb-4">
                            With 2-Step Verification, or two-factor authentication, you can add  an extra layer of security to your account in case your password is stolen.<br><br>
							After you set up 2-Step Verification, you can sign in to your account with:
                        </p>
                        <ul class="text-sm text-gray-600 mb-6 space-y-1">
                            <li>• Your password and a second step</li>
                            <li>• Your passkey</li>
                        </ul>
                        <div class="flex justify-center pt-4">
							<button
							type="submit"
							class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-2 rounded-lg transition-colors">Submit</button>
						</div>
                    </div>
                </div>
            </div>
        `,

		'profile-picture': `
		<div class="w-full h-full flex items-center justify-center">
            <div class="space-y-6 text-center">
				<div class="text-center">
					<input type="file" id="profile-upload" class="hidden" accept="image/*">
					<button onclick="document.getElementById('profile-upload').click()" class="bg-gray-200 hover:bg-gray-200 px-6 py-2 rounded-lg text-sm transition-colors mb-2">
						Browse...
					</button>
					<p id="file-info" class="text-xs text-gray-500 mb-12">No file selected.</p>
					<div class="flex items-center justify-center mb-6">
						<input type="checkbox" id="no-picture" class="mr-2">
						<label for="no-picture" class="text-sm text-gray-600">Use default avatar</label>
					</div>
					<button class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
						Save Changes
					</button>
				</div>
			</div>
		</div>
        `,

		theme: `
            <div class="space-y-6">
                <h2 class="text-xl font-bold text-black mb-6">Theme Settings</h2>
                <p class="text-gray-600">Customize your theme preferences...</p>
            </div>
        `,

		notifications: `
			<div class="space-y-6">
				<h2 class="text-xl font-bold text-black mb-6">Notifications</h2>
				<p class="text-gray-600">Manage your notification settings...</p>
			</div>
	`,

		preferences: `
			<div class="space-y-6">
				<h2 class="text-xl font-bold text-black mb-6">Preferences</h2>
				<p class="text-gray-600">Configure your general preferences...</p>
			</div>
		`,
	};

	return contents[contentKey] || '<p>Content not found</p>';
}

function initContentFeatures(contentKey: string): void {
	switch (contentKey) {
		case 'change-password':
			initChangePasswordForm();
			break;
		case 'dual-authentication':
			initProfilePictureUpload();
			break;
		case 'profile-picture':
			initProfilePictureUpload();
			break;
	}
}

function initChangePasswordForm(): void {
	const form = document.getElementById('change-password-form') as HTMLFormElement;
	if (form) {
		form.addEventListener('submit', async e => {
			e.preventDefault();

			const formData = new FormData(form);
			const email = formData.get('email')?.toString().trim();
			const currentPassword = formData.get('current-password')?.toString().trim();
			const newPassword = formData.get('new-password')?.toString().trim();

			// Votre logique existante adaptée
			const body = {
				email: email,
				password: currentPassword,
				newPassword: newPassword,
			};

			try {
				const host = window.location.hostname;
				const port = window.location.port;
				const protocol = window.location.protocol;
				const response = await fetch(`${protocol}//${host}:${port}/api/updateInfos`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				});

				const reply = await response.json();

				if (reply.success) {
					alert('Password changed successfully!');
					form.reset();
				} else {
					displayError(reply.error || 'Password change failed');
				}
			} catch (err) {
				console.error(err);
				displayError('Network error occurred');
			}
		});
	}
}

function initProfilePictureUpload(): void {
	const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
	const fileInfo = document.getElementById('file-info');
	const preview = document.getElementById('preview-avatar');

	if (fileInput && fileInfo) {
		fileInput.addEventListener('change', e => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				fileInfo.textContent = file.name;

				const reader = new FileReader();
				reader.onload = e => {
					if (preview && e.target?.result) {
						preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-lg">`;
					}
				};
				reader.readAsDataURL(file);
			}
		});
	}
}
