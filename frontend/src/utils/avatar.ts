interface UserData {
	avatar?: string;
	login?: string;
	email?: string;
	nickName?: string;

	name?: string;
    firstName?: string;
    lastName?: string;
}

function updateProfileBlock(userData?: UserData): void {
    console.log('=== updateProfileBlock called ===');

    if (!userData) {
        console.log('No user data provided');
        return;
    }

    // 1. METTRE À JOUR L'AVATAR
    updateProfileAvatar(userData.avatar);

    // 2. METTRE À JOUR LE NOM
    const displayNameEl = document.getElementById('profile-display-name');
    if (displayNameEl) {
        const displayName = getDisplayName(userData);
        displayNameEl.textContent = displayName;
        console.log('✅ Display name updated:', displayName);
    }

    // 3. METTRE À JOUR LE USERNAME
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) {
        const username = userData.login || userData.nickName || 'user';
        usernameEl.textContent = `@${username}`;
        console.log('✅ Username updated:', username);
    }

    // 4. METTRE À JOUR LA LOCALISATION/EMAIL
    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
        // Vous pouvez choisir d'afficher l'email, la localisation, ou autre chose
        if (userData.email) {
            locationEl.textContent = `📧 ${userData.email}`;
        } else {
            locationEl.textContent = '📍 Unknown';
        }
        console.log('✅ Location/Email updated');
    }
}

function updateProfileAvatar(avatarData?: string): void {
    console.log('=== updateProfileAvatar called ===');

    const container = document.getElementById('profile-avatar-container');
    if (!container) {
        console.error('Profile avatar container not found!');
        return;
    }

    // Vider le container
    container.innerHTML = '';

    if (avatarData) {
        // Créer l'image
        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover rounded-xl';
        img.alt = 'Profile picture';

        // Gérer le format base64
        let imageSrc = avatarData;
        if (!avatarData.startsWith('data:image/')) {
            if (avatarData.startsWith('iVBOR')) {
                imageSrc = `data:image/png;base64,${avatarData}`;
            } else if (avatarData.startsWith('/9j/')) {
                imageSrc = `data:image/jpeg;base64,${avatarData}`;
            } else {
                imageSrc = `data:image/png;base64,${avatarData}`;
            }
        }

        img.src = imageSrc;

        img.onload = () => {
            console.log('✅ Profile avatar loaded successfully!');
        };

        img.onerror = () => {
            console.error('❌ Profile avatar failed to load, showing fallback');
            showProfileFallback(container);
        };

        container.appendChild(img);

    } else {
        // Pas d'avatar, afficher le fallback
        showProfileFallback(container);
    }
}

function showProfileFallback(container: HTMLElement): void {
    const userData = getCurrentUser();
    const initial = userData ? getFirstLetter(userData) : 'U';

    container.innerHTML = `
        <div class="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-4xl font-bold">
            ${initial}
        </div>
    `;
}

export async function initProfilePage(): Promise<void> {
    console.log('=== initProfilePage called ===');

    // 1. Récupérer les données utilisateur depuis le serveur
    await fetchAndSaveUserInfo();

    // 2. Attendre que le DOM soit prêt
    setTimeout(() => {
        // 3. Récupérer les données depuis localStorage
        const userData = getCurrentUser();

        if (userData) {
            console.log('User data found:', userData);
            updateProfileBlock(userData);
        } else {
            console.log('No user data found, showing default');
            updateProfileBlock({
                nickName: 'Guest User',
                login: 'guest',
                email: 'guest@example.com'
            });
        }
    }, 100);
}

//recup les donnees user actuelles

export function getCurrentUser(): UserData | null {
    try {
        const userDataStr = localStorage.getItem('currentUser');
        if (userDataStr) {
            return JSON.parse(userDataStr);
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

export async function fetchAndSaveUserInfo(): Promise<void> {

	try {
		const response = await fetch('https://localhost:8080/api/updateInfos',{
			method: 'GET',
			credentials: 'include',
		});

		const result = await response.json();

		if(result.success && result.user){

			const currentUser = getCurrentUser();
			const existingAvatar = currentUser?.avatar;

			// utiliser l'avatar du serveur en priorite, sinon celui existant
			const avatar = result.user.avatar || existingAvatar;

			//mettre toutes les nouvelles infos en meme endroit
			const completeUserData = {
				avatar: avatar,
				nickName: result.user.nickName,
				login: result.user.login,
				email: result.user.email,
			};

			//saugarde des donnees
			localStorage.setItem('currentUser', JSON.stringify(completeUserData));

			console.log('Complete user data saved:', completeUserData);
			console.log('Avatar found:', !!avatar);

			//maj affichage apres la sauvegarde
			setTimeout(() => {
				updateAvatarDisplay(avatar);
			}, 100);
		}

	} catch (error) {
		console.log('Error fetching failed:', error);
	}
}

function updateAvatarDisplay(avatarData?: string): void {
    console.log('=== updateAvatarDisplay called ===');
    console.log('Avatar data received:', avatarData ? 'Yes' : 'No');

    // Chercher le container par ID (plus fiable)
    const container = document.getElementById('avatar-container');

    if (!container) {
        console.error('Avatar container not found!');
        return;
    }

    console.log('Container found:', container);

    // Vider complètement le container
    container.innerHTML = '';

    if (avatarData) {
        // Créer l'image
        const img = document.createElement('img');
        img.id = 'profile-image';
        img.className = 'w-full h-full object-cover';
        img.alt = 'Profile picture';

        // Gérer le format base64
        let imageSrc = avatarData;
        if (!avatarData.startsWith('data:image/')) {
            if (avatarData.startsWith('iVBOR')) {
                imageSrc = `data:image/png;base64,${avatarData}`;
            } else if (avatarData.startsWith('/9j/')) {
                imageSrc = `data:image/jpeg;base64,${avatarData}`;
            } else {
                imageSrc = `data:image/png;base64,${avatarData}`;
            }
        }

        img.src = imageSrc;

        img.onload = () => {
            console.log('✅ Avatar loaded successfully!');
        };

        img.onerror = () => {
            console.error('❌ Avatar failed to load, showing fallback');
            showFallback(container);
        };

        container.appendChild(img);

    } else {
        // Pas d'avatar
        showFallback(container);
    }
}

function showFallback(container: HTMLElement): void {
    const userData = getCurrentUser();
    const initial = userData ? getFirstLetter(userData) : 'U';

    container.innerHTML = `
        <div class="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center text-lg font-bold">
            <span>${initial}</span>
        </div>
    `;
}

export function initUserAvatar(): void {
    console.log('=== initUserAvatar called ===');

    const userData = getCurrentUser();
    if (!userData) {
        console.log('No user data found');
        updateAvatarDisplay(); // Affiche le fallback
        return;
    }

    console.log('User data found:', userData);

    // Mettre à jour le nom
    const userName = document.getElementById('user-name') as HTMLElement;
    if (userName) {
        userName.textContent = getDisplayName(userData);
    }

    // Mettre à jour l'email
    const userEmail = document.getElementById('user-email') as HTMLElement;
    if (userEmail && userData.email) {
        userEmail.textContent = userData.email;
    }

    // Mettre à jour l'avatar
    updateAvatarDisplay(userData.avatar);
}

// Fonction pour obtenir le nom d'affichage
function getDisplayName(userData: UserData): string {
    // Essayer différentes combinaisons selon votre structure de données
    if (userData.nickName) return userData.nickName;
    if (userData.firstName && userData.lastName) return `${userData.firstName} ${userData.lastName}`;
    if (userData.name) return userData.name;
    if (userData.login) return userData.login;
    return 'Utilisateur';
}

// Fonction pour obtenir la première lettre
function getFirstLetter(userData: UserData): string {
    const name = getDisplayName(userData);
    return name.charAt(0).toUpperCase();
}

// Vérifier si l'utilisateur est connecté
export function isUserLoggedIn(): boolean {
    return getCurrentUser() !== null;
}
