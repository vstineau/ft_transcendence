import { navigateTo, authenticatedFetch} from '../main';
import { displayError } from '../utils/error';
import { readFileAsBase64 } from '../utils/userInfo';
import { fetchAndSaveUserInfo, initUserAvatar, getCurrentUser, updateProfileAvatar} from '../utils/avatar';
import { init2FASetup } from '../user/2fasetup';

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
				} else {
					body.ext = imageExtension(base64);
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
				credentials: 'include',
				body: JSON.stringify(body),
			});
			const reply = await response.json();
			console.log(reply);
			if (reply.success) {
				navigateTo('/dashboard');
			} else {
				displayError(reply.error || 'registration failed please try again');
			}
		} catch (err) {
			console.log(err);
		}
	});
}

function imageExtension(base64: string): string {
  if (base64.startsWith('iVBOR')) return 'png';
  if (base64.startsWith('/9j/')) return 'jpeg';
  if (base64.startsWith('R0lGOD')) return 'gif';
  if (base64.startsWith('UklGR')) return 'webp';
  return 'png'; // défaut
}

function initUpdateInfosPage(): void {
	console.log('=== Initializing UpdateInfos page ===');

	// Initialiser les onglets
	initTabs();
	// Initialiser les menus
	initMenuItems();
    // Afficher le contenu par défaut
    showContent('change-password');
	initMenuItems();
	// Afficher le contenu par défaut
	showContent('change-password');
	// Edit le profil
	initEditProfileButton();
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
			<form id="change-password-form" class="space-y-4">
				<input
					autocomplete="off"
					type="email"
					name="email"
					id="email"
					placeholder="Email"
					class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
					required
				/>
				<input
					type="password"
					name="current-password"
					id="current-password"
					placeholder="Current Password"
					class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
					required
				/>
				<input
					type="password"
					name="new-password"
					id="new-password"
					placeholder="New Password"
					class="w-full px-0 py-3 border-0 border-b border-black focus:outline-none focus:border-black transition-colors bg-transparent"
					required
				/>
				<div class="flex justify-center pt-4">
					<button type="submit" class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-2 rounded-lg transition-colors">
						Submit
					</button>
				</div>
			</form>
			`,

		'dual-authentication': `
		<div class="space-y-6">
			<div class="flex items-start">
			<input type="checkbox" id="settings-enable2fa" class="w-5 h-5 mt-1 mr-4">
				<div>
					<h3 class="font-medium text-black text-medium mb-2">Turn on 2-Step Verification</h3>
					<p class="text-sm text-gray-600 mb-4">
						With 2-Step Verification, or two-factor authentication, you can add an extra layer of security to your account in case your password is stolen.<br><br>
						After you set up 2-Step Verification, you can sign in to your account with:
					</p>
					<ul class="text-sm text-gray-600 mb-6 space-y-1">
						<li>• Your password and a second step</li>
						<li>• Your passkey</li>
					</ul>
					<form id="enable-2fa-form">
						<div class="flex justify-center pt-4">
							<button
								type="submit"
								class="w-1/2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-2 rounded-lg transition-colors">
								Submit
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		`,

		'profile-picture': `
		<div class="w-full h-full flex items-center justify-center">
            <div class="space-y-6 text-center">
				<!-- Upload area -->
					<div class="space-y-4">
					<input type="file" id="profile-upload-input" class="hidden" accept="image/*">
					<button
						type="button"
						onclick="document.getElementById('profile-upload-input').click()"
						class="bg-gray-200 hover:bg-gray-200 px-6 py-2 rounded-lg text-sm transition-colors mb-2">
						Browse...
					</button>
					<p id="file-info" class="text-xs text-gray-500 mb-12">No file selected.</p>
					</div>

					<!-- Form just for save -->
					<form id="profile-upload-form" class="space-y-4">
					<div class="flex items-center justify-center mb-6">
						<input type="checkbox" id="no-picture" class="mr-2">
						<label for="no-picture" class="text-sm text-gray-600">Use default avatar</label>
					</div>

					<button type="submit"
						class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
						Save Changes
					</button>
					</form>

				</div>
			</div>
		</div>
        `,

		'language': `
			<div class="space-y-6" style="width: 100%;">
				<h2 class="font-montserrat font-medium text-black mb-4">Select language</h2>

				<div class="flex items-start">
					<input type="radio" name="language" id="langage_fr" value="fr" class="square-radio mr-4">
					<label for="langage_fr" class="font-medium text-black">French</label>
				</div>
				<div class="flex items-start">
					<input type="radio" name="language" id="langage_en" value="en" class="square-radio mr-4" checked>
					<label for="langage_en" class="font-medium text-black">English</label>
				</div>
				<div class="flex items-start">
					<input type="radio" name="language" id="langage_sp" value="es" class="square-radio mr-4">
					<label for="langage_sp" class="font-medium text-black">Spanish</label>
				</div>

				<div style="width: 100%; display: flex; justify-content: center; padding-top: 16px;">
					<button
						type="submit"
						style="background-color: black; color: white; padding: 12px 32px; border-radius: 8px; border: none; cursor: pointer;">
						Submit
					</button>
				</div>
		`,

		'privacy-policy': `
			<div class="space-y-6">
				<h2 class="font-montserrat font-medium text-black mb-4">General Privacy Policy & Terms of Service</h2>

				<div class="text-sm text-gray-700 space-y-4">
					<div>
						<h3 class="font-medium text-black mb-2">Privacy Policy</h3>
						<p>This is an educational project. We collect minimal user data (username, email, game scores) for functionality purposes only. Data is stored securely and not shared with third parties.</p>
					</div>

					<div>
						<h3 class="font-medium text-black mb-2">Terms of Service</h3>
						<p>This platform is provided for educational purposes. Users must not attempt to harm the system or other users. We reserve the right to suspend accounts for inappropriate behavior.</p>
					</div>

					<div>
						<h3 class="font-medium text-black mb-2">Data Usage</h3>
						<p>User data is used solely for game functionality and account management. Data may be deleted upon request.</p>
					</div>

					<div>
						<h3 class="font-medium text-black mb-2">Contact</h3>
						<p>For questions regarding privacy or terms, contact: [votre email étudiant]</p>
					</div>
				</div>

				<div class="flex justify-center pt-4">
					<button class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
						I Agree
					</button>
				</div>
			</div>
		`,

		'delete': `
			<div class="space-y-6">
				<h2 class="font-montserrat font-medium text-black mb-4">Delete your account</h2>

				<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
					<div class="flex">
						<div class="text-red-500 mr-3">⚠️</div>
						<div>
							<h3 class="text-red-800 font-medium mb-2">Warning: This action is irreversible</h3>
							<p class="text-sm text-red-700">
								Deleting your account will permanently remove all your data, game history, and settings.
								This cannot be undone.
							</p>
						</div>
					</div>
				</div>

				<form id="delete-account-form" class="space-y-4">
					<p class="text-sm text-gray-600 mb-4">
						To confirm account deletion, please enter your email and password:
					</p>

            	<input
				type="email"
				name="email"
				id="delete-email"
				placeholder="Email"
				class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
				required
            	/>

            	<input
				type="password"
				name="password"
				id="delete-password"
				placeholder="Password"
				class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
				required
            	/>

            <div style="width: 100%; display: flex; justify-content: center; padding-top: 16px;">
					<button
						type="submit"
						style="background-color: #DC2626; color: white; padding: 12px 32px; border-radius: 8px; border: none; cursor: pointer; transition: background-color 0.3s;"
						onmouseover="this.style.backgroundColor='#B91C1C'"
						onmouseout="this.style.backgroundColor='#DC2626'"
					>
						Delete Account Forever
					</button>
				</div>
			</form>
		</div>
	`,

	'edit-profile': `
		<div class="space-y-6">
			<h2 class="font-montserrat font-medium text-black mb-4">Edit profile</h2>
				<form id="edit-profile-form" class="space-y-4">

					<input
						type="text"
						name="username"
						id="edit-username"
						placeholder="Username (without @)"
						class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors bg-transparent"
					/>

					<input
						type="text"
						name="nickName"
						id="edit-nickName"
						placeholder="Nick Name"
						class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors bg-transparent"
					/>

					<input
						type="email"
						name="email"
						id="edit-email"
						placeholder="Email"
						class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors bg-transparent"
					/>

					<div class="flex justify-center pt-4">
						<button type="submit" class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
							Save Changes
						</button>
					</div>
				</form>
		</div>
	`
};

	return contents[contentKey] || '<p>Content not found</p>';
}

function initEditProfileForm(): void {
    console.log("=== DEBUGGING initEditProfileForm ===");

    // 1. Vérifier les cookies
    console.log("Document cookies:", document.cookie);

    // 2. Vérifier les données utilisateur
    const userData = getCurrentUser();
    console.log("Current user data:", userData);

    const form = document.getElementById('edit-profile-form') as HTMLFormElement;
    if (!form) {
        console.log("❌ Form not found");
        return;
    }

    if (userData) {
        // const firstNameInput = document.getElementById('edit-firstName') as HTMLInputElement;
        // const lastNameInput = document.getElementById('edit-lastName') as HTMLInputElement;
        const nickNameInput = document.getElementById('edit-nickName') as HTMLInputElement;
		const usernameInput = document.getElementById('edit-username') as HTMLInputElement;
        const emailInput = document.getElementById('edit-email') as HTMLInputElement;

        // if (firstNameInput) firstNameInput.value = userData.firstName || '';
        // if (lastNameInput) lastNameInput.value = userData.lastName || '';
        if (nickNameInput) nickNameInput.value = userData.nickName || '';
        if (emailInput) emailInput.value = userData.email || '';
		if (usernameInput && userData.login) {
			usernameInput.value = userData.login;
		}
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("=== FORM SUBMIT DEBUG ===");

        const formData = new FormData(form);
        const body = {
            login: formData.get('username')?.toString().trim(),
            nickName: formData.get('nickName')?.toString().trim(),
            password: '',
            newPassword: '',
            email: formData.get('email')?.toString().trim(),
            avatar: '',
            noAvatar: false,
            ext: '',
        };

        console.log("Body being sent:", body);
        console.log("Cookies before request:", document.cookie);

        try {
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;
            const url = `${protocol}//${host}:${port}/api/updateInfos`;

            console.log("Request URL:", url);
            console.log("Request headers will include credentials");

	const response = await authenticatedFetch(`${protocol}//${host}:${port}/api/updateInfos`, {                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", [...response.headers.entries()]);

            const result = await response.json();
            console.log("Full response:", result);

            if (result.success) {
                console.log("✅ Success!");
                alert('Profile updated successfully!');
            } else {
                console.log("❌ Backend error:", result.error);
                displayError(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.log("❌ Network error:", error);
            displayError('Network error occurred');
        }
    });
}

// Ajoutez cette fonction pour tester l'authentification
async function testAuth(): Promise<void> {
    // console.log("=== TESTING AUTHENTICATION ===");
    // console.log("Cookies:", document.cookie);

    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/updateInfos`, {
            method: 'GET',
            credentials: 'include',
        });

        console.log("Auth test response status:", response.status);
        const result = await response.json();
        console.log("Auth test result:", result);

    } catch (error) {
        console.log("Auth test error:", error);
    }
}


function initContentFeatures(contentKey: string): void {
	switch (contentKey) {
		case 'change-password':
			initChangePasswordForm();
			break;
		case 'dual-authentication':
            init2FASetup();
            break;
        case 'profile-picture':
            initProfilePictureUpload();
            break;
		case 'delete':
            initDeleteAccountForm();
            break;
		case 'edit-profile':
            initEditProfileForm();
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

            if (!email || !currentPassword || !newPassword) {
                displayError('All fields are required');
                return;
            }

            const body = {
                login: '',
                nickName: '',
                password: currentPassword,
                newPassword: newPassword,
                email: email,
                avatar: '',
                noAvatar: false,
                ext: '',
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
                    credentials: 'include',
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
	const fileInput = document.getElementById('profile-upload-input') as HTMLInputElement;
	const fileInfo = document.getElementById('file-info');
	const preview = document.getElementById('preview-avatar');
	const form = document.getElementById('profile-upload-form') as HTMLFormElement;

	if (!fileInput || !form) return;

	// Preview file name + image
	fileInput.addEventListener('change', e => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
		if (fileInfo) fileInfo.textContent = file.name;

		const reader = new FileReader();
		reader.onload = ev => {
			if (preview && ev.target?.result) {
			preview.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover rounded-lg">`;
			}
		};
		reader.readAsDataURL(file);
		}
	});

	// Submit form
	form.addEventListener('submit', async e => {
		e.preventDefault();

		const file = fileInput.files?.[0];
		const noPicture = (document.getElementById('no-picture') as HTMLInputElement)?.checked;

		const body: any = {
		login: '',
		nickName: '',
		password: '',
		newPassword: '',
		email: '',
		avatar: '',
		noAvatar: noPicture,
		ext: '',
		};

		if (file && !noPicture) {
		try {
			const base64 = await readFileAsBase64(file);
			body.avatar = base64;

			const fileName = file.name;
			const lastDot = fileName.lastIndexOf('.');
			if (lastDot !== -1) {
			body.ext = fileName.slice(lastDot + 1).toLowerCase();
			}
		} catch (err) {
			displayError('Error with avatar upload');
			return;
		}
		}

		try {
		const host = window.location.hostname;
		const port = window.location.port;
		const protocol = window.location.protocol;

		const response = await fetch(`${protocol}//${host}:${port}/api/updateInfos`, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(body),
		});

		const reply = await response.json();
		console.log("Upload response:", reply);

		if (reply.success) {
			console.log("=== AVATAR UPDATE DEBUG ===");
			console.log("Full reply:", reply);
			console.log("reply.user exists:", !!reply.user);
			console.log("reply.user.avatar exists:", !!reply.user?.avatar);
			console.log("Avatar data length:", reply.user?.avatar?.length);

			const currentUser = getCurrentUser();
			console.log("Current user before update:", currentUser);

			if (currentUser && reply.user && reply.user.avatar) {
				currentUser.avatar = reply.user.avatar;
				localStorage.setItem('currentUser', JSON.stringify(currentUser));
				console.log("Updated localStorage with new avatar");

				// Vérifier que la sauvegarde a fonctionné
				const savedUser = getCurrentUser();
				console.log("Saved user after update:", savedUser);
				console.log("Saved avatar length:", savedUser?.avatar?.length);
			} else {
				console.log("Missing data - reply.user:", !!reply.user, "avatar:", !!reply.user?.avatar);
			}

			setTimeout(() => {
				console.log("Calling initUserAvatar...");
				initUserAvatar();
			}, 100);

			alert("Profile picture updated!");
		} else {
			displayError(reply.error || "Upload failed");
		}
		} catch (err) {
		console.error(err);
		displayError("Network error during upload");
		}
	});
}


function initDeleteAccountForm(): void {
    const form = document.getElementById('delete-account-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Double confirmation avant suppression
        const confirmed = confirm(
            "Are you absolutely sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        const formData = new FormData(form);
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString().trim();

        if (!email || !password) {
            displayError('Please enter both email and password');
            return;
        }

        try {
            // Désactiver le bouton pendant la requête
            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Deleting...';
                submitButton.style.backgroundColor = '#9CA3AF';
            }

            // Appel à votre API de suppression
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;

            const response = await fetch(`${protocol}//${host}:${port}/api/deleteAccount`, {
                method: 'POST', // Changé en POST pour envoyer les données
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Pour les cookies
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Your account has been successfully deleted.');
                // Rediriger vers la page d'accueil
                window.location.href = '/';
            } else {
                displayError(result.error || 'Failed to delete account. Please check your credentials.');

                // Réactiver le bouton
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Delete Account Forever';
                    submitButton.style.backgroundColor = '#DC2626';
                }
            }

        } catch (error) {
            console.error('Delete account error:', error);
            displayError('Network error occurred. Please try again.');

            // Réactiver le bouton
            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Delete Account Forever';
                submitButton.style.backgroundColor = '#DC2626';
            }
        }
    });
}


function initEditProfileButton(): void {
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log('Edit profile clicked');

            // Désactiver tous les menu items actifs
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });

            // Afficher le contenu d'édition de profil
            showContent('edit-profile');
        });
    }
}

