import { navigateTo } from '../main';
import { displayError } from '../utils/error'
import { readFileAsBase64 } from '../utils/userInfo'
import { fetchAndSaveUserInfo, initUserAvatar } from '../utils/avatar';

export async function updateInfos() {

	await fetchAndSaveUserInfo();

	 setTimeout(() => {
        initUserAvatar();
    }, 100);

	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return true;

	let state: boolean = false;
	const noAvatar = document.getElementById('defaultAvatars') as HTMLElement | null;
	if (noAvatar) {
		noAvatar.addEventListener('click', (e) => {
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
		const response = await fetch('https://localhost:8080/api/updateInfos', {
			method: 'GET',
		});
		const reply = await response.json();
		const loginInput = document.getElementById('login') as HTMLInputElement | null;
		const nicknameInput = document.getElementById('nickname') as HTMLInputElement | null;
		const mailInput = document.getElementById('mail') as HTMLInputElement | null;
		loginInput ? loginInput.placeholder = reply.user.login : "";
		nicknameInput ? nicknameInput.placeholder = reply.user.nickName : "";
	    mailInput ? mailInput.placeholder = reply.user.email : "";}
	catch (err ){}
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
		const response = await fetch('https://localhost:8080/api/updateInfos', {
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
		 }
		 else {
			displayError(reply.error || "registration failed please try again");
		}
		} catch (err) {
			console.log(err);
		}
	});
}


function initUpdateInfosPage(): void {
    console.log('=== Initializing UpdateInfos page ===');

    // Initialiser l'avatar
    initUserAvatar();

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

    // Cacher tous les menus
    document.querySelectorAll('.tab-menu').forEach(menu => {
        menu.classList.add('hidden');
    });

    // Afficher le menu correspondant
    const targetMenu = document.getElementById(`${tabName}-menu`);
    if (targetMenu) {
        targetMenu.classList.remove('hidden');

        // Activer le premier item du menu
        const firstMenuItem = targetMenu.querySelector('.menu-item');
        if (firstMenuItem) {
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });

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
            <form id="change-password-form" class="space-y-6">
                <h2 class="text-xl font-bold text-black mb-6">Change Password</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
                    required
                />

                <input
                    type="password"
                    name="current-password"
                    placeholder="Current Password"
                    class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
                    required
                />

                <input
                    type="password"
                    name="new-password"
                    placeholder="New Password"
                    class="w-full px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
                    required
                />

                <div class="flex justify-center pt-4">
                    <button
                        type="submit"
                        class="bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                    >
                        Submit
                    </button>
                </div>
            </form>
        `,

        'dual-auth': `
            <div class="space-y-6">
                <h2 class="text-xl font-bold text-black mb-6">Two-Factor Authentication</h2>

                <div class="flex items-start">
                    <input type="checkbox" id="enable-2fa" class="w-5 h-5 mt-1 mr-4">
                    <div>
                        <h3 class="font-medium text-black mb-2">Turn on 2-Step Verification</h3>
                        <p class="text-sm text-gray-600 mb-4">
                            Add an extra layer of security to your account with two-factor authentication.
                        </p>
                        <ul class="text-sm text-gray-600 mb-6 space-y-1">
                            <li>• Your password and a second step</li>
                            <li>• Your passkey</li>
                        </ul>
                        <button class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
                            Enable 2FA
                        </button>
                    </div>
                </div>
            </div>
        `,

        'profile-picture': `
            <div class="space-y-6">
                <h2 class="text-xl font-bold text-black mb-6">Profile Picture</h2>

                <div class="text-center">
                    <div id="preview-avatar" class="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                        U
                    </div>

                    <input type="file" id="profile-upload" class="hidden" accept="image/*">
                    <button onclick="document.getElementById('profile-upload').click()" class="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-lg text-sm transition-colors mb-4">
                        Browse Files
                    </button>
                    <p id="file-info" class="text-xs text-gray-500 mb-4">No file selected.</p>

                    <div class="flex items-center justify-center mb-6">
                        <input type="checkbox" id="no-picture" class="mr-2">
                        <label for="no-picture" class="text-sm text-gray-600">Use default avatar</label>
                    </div>

                    <button class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        `
    };

    return contents[contentKey] || '<p>Content not found</p>';
}

function initContentFeatures(contentKey: string): void {
    switch (contentKey) {
        case 'change-password':
            initChangePasswordForm();
            break;
        case 'profile-picture':
            initProfilePictureUpload();
            break;
    }
}

function initChangePasswordForm(): void {
    const form = document.getElementById('change-password-form') as HTMLFormElement;
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const email = formData.get('email')?.toString().trim();
            const currentPassword = formData.get('current-password')?.toString().trim();
            const newPassword = formData.get('new-password')?.toString().trim();

            // Votre logique existante adaptée
            const body = {
                email: email,
                password: currentPassword,
                newPassword: newPassword
            };

            try {
                const response = await fetch('https://localhost:8080/api/updateInfos', {
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
                    displayError(reply.error || "Password change failed");
                }
            } catch (err) {
                console.error(err);
                displayError("Network error occurred");
            }
        });
    }
}

function initProfilePictureUpload(): void {
    const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
    const fileInfo = document.getElementById('file-info');
    const preview = document.getElementById('preview-avatar');

    if (fileInput && fileInfo) {
        fileInput.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                fileInfo.textContent = file.name;

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (preview && e.target?.result) {
                        preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-lg">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}
