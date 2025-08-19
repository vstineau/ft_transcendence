interface UserData {
	avatar?: string;
	login?: string;
	email?: string;
	nickName?: string;

	name?: string;
    firstName?: string;
    lastName?: string;
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

// function updateAvatarDisplay(avatarData?: string): void{
//     const profileImage = document.getElementById('profile-image') as HTMLImageElement;
//     const fallback = document.querySelector('.w-12.h-12.bg-gray-300') as HTMLElement;

//     if(profileImage && avatarData){
//         console.log('Settings avatar source:', avatarData.substring(0, 50)+ '...');

//         // CORRECTION : Ajouter le préfixe si manquant
//         let imageSrc = avatarData;
//         if (!avatarData.startsWith('data:image/')) {
//             if (avatarData.startsWith('iVBOR')) {
//                 imageSrc = `data:image/png;base64,${avatarData}`;
//             } else if (avatarData.startsWith('/9j/')) {
//                 imageSrc = `data:image/jpeg;base64,${avatarData}`;
//             } else {
//                 imageSrc = `data:image/png;base64,${avatarData}`;
//             }
//             console.log('Added missing data URI prefix');
//         }

//         profileImage.src = imageSrc;
//         profileImage.style.display = 'block';

//         if(fallback){
//             fallback.style.display = 'none';
//         }

//         // REMPLACEZ cette partie par le debug
//         profileImage.onload = () => {
//             console.log('Avatar BASE64 loaded sucessfully');

//             // DEBUG CSS
//             console.log('Image display:', profileImage.style.display);
//             console.log('Image dimensions:', profileImage.width, 'x', profileImage.height);
//             console.log('Image position:', profileImage.offsetLeft, profileImage.offsetTop);
//             console.log('Parent container:', profileImage.parentElement);

//             // Force l'affichage
//             profileImage.style.display = 'block';
//             profileImage.style.width = '48px';
//             profileImage.style.height = '48px';
//             profileImage.style.zIndex = '999';
//         };

//         profileImage.onerror = (error) => {
//             console.error('Error loading BASE64 avatar:', error);
//             profileImage.style.display = 'none';
//             if (fallback){
//                 fallback.style.display= 'flex';
//             }
//         };
//     }else {
//         console.log('No avatar data, showing fallback');
//         if(profileImage){
//             profileImage.style.display = 'none';
//         }
//         if(fallback){
//             fallback.style.display = 'flex';
//         }
//     }
// }


// Initialiser l'avatar et les infos utilisateur dans l'interface
// export function initUserAvatar(): void {
//     const userData = getCurrentUser();

//     if (!userData) {
//         console.log('No user data found');
//         return;
//     }
// 	console.log('Raw user data:', userData);

//     // Mettre à jour l'image de profil
// const profileImage = document.getElementById('profile-image') as HTMLImageElement;
//     if (profileImage && userData?.avatar) {
//         profileImage.src = userData.avatar;
//         profileImage.style.display = 'block';

//         profileImage.onerror = () => {
//             // En cas d'erreur, afficher la lettre par défaut
//             profileImage.style.display = 'none';
//             const fallback = profileImage.nextElementSibling as HTMLElement;
//             if (fallback) {
//                 fallback.style.display = 'flex';
//                 // Mettre la première lettre du nom
//                 const initial = getFirstLetter(userData);
//                 const initialSpan = fallback.querySelector('#user-initial') as HTMLElement;
//                 if (initialSpan) {
//                     initialSpan.textContent = initial;
//                 }
//             }
//         };
//     } else {
//         // Pas d'avatar, afficher l'initiale
//         const fallback = document.querySelector('.w-12.h-12.bg-gray-300') as HTMLElement;
//         if (fallback) {
//             const initial = getFirstLetter(userData);
//             const initialSpan = fallback.querySelector('#user-initial') as HTMLElement;
//             if (initialSpan) {
//                 initialSpan.textContent = initial;
//             }
//         }
//     }

//     // Mettre à jour le nom d'utilisateur
//     const userName = document.getElementById('user-name') as HTMLElement;
//     if (userName) {
//         const displayName = getDisplayName(userData);
//         userName.textContent = displayName;
//     }

//     // Mettre à jour l'email si l'élément existe
//     const userEmail = document.getElementById('user-email') as HTMLElement;
//     if (userEmail && userData.email) {
//         userEmail.textContent = userData.email;
//     }

//     console.log('User info loaded:', {
//         name: getDisplayName(userData),
//         email: userData.email,
//         hasAvatar: !!userData.avatar
//     });
// }

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
