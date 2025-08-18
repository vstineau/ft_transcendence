interface UserData {
	avatar?: string;
	login?: string;
	email?: string;
	nickName?: string;
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

// Initialiser l'avatar et les infos utilisateur dans l'interface
export function initUserAvatar(): void {
    const userData = getCurrentUser();

    if (!userData) {
        console.log('No user data found');
        return;
    }

    // Mettre à jour l'image de profil
    const profileImage = document.getElementById('profile-image') as HTMLImageElement;
    if (profileImage && userData.avatar) {
        profileImage.src = userData.avatar;
        profileImage.style.display = 'block';

        profileImage.onerror = () => {
            // En cas d'erreur, afficher la lettre par défaut
            profileImage.style.display = 'none';
            const fallback = profileImage.nextElementSibling as HTMLElement;
            if (fallback) {
                fallback.style.display = 'flex';
                // Mettre la première lettre du nom
                const initial = userData.nickName?.charAt(0).toUpperCase() || userData.login?.charAt(0).toUpperCase() || 'U';
                const initialSpan = fallback.querySelector('#user-initial') as HTMLElement;
                if (initialSpan) {
                    initialSpan.textContent = initial;
                }
            }
        };
    } else {
        // Pas d'avatar, afficher la lettre par défaut
        const profileImage = document.getElementById('profile-image') as HTMLImageElement;
        const fallback = profileImage?.nextElementSibling as HTMLElement;
        if (fallback) {
            fallback.style.display = 'flex';
            const initial = userData.nickName?.charAt(0).toUpperCase() || userData.login?.charAt(0).toUpperCase() || 'U';
            const initialSpan = fallback.querySelector('#user-initial') as HTMLElement;
            if (initialSpan) {
                initialSpan.textContent = initial;
            }
        }
    }

    // Mettre à jour le nom d'utilisateur
    const userName = document.getElementById('user-name') as HTMLElement;
    if (userName) {
        // Priorité au nickName, sinon login
        const displayName = userData.nickName || userData.login || 'User';
        userName.textContent = displayName;
    }

    // Mettre à jour l'email s'il y a un élément pour ça
    const userEmail = document.getElementById('user-email') as HTMLElement;
    if (userEmail && userData.email) {
        userEmail.textContent = userData.email;
    }

    console.log('User info loaded:', {
        name: userData.nickName || userData.login,
        email: userData.email,
        hasAvatar: !!userData.avatar
    });
}

export function isUserLoggedIn(): boolean {
	return getCurrentUser() !== null;
}
