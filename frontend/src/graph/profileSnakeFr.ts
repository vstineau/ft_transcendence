import { SnakeGameHistory, ProfileSnake } from '../types/snakeTypes';
import { navigateTo, authenticatedFetch} from '../main';
import { formatGameTime, formatDate } from '../graph/init';

async function fetchUserProfile(): Promise<ProfileSnake | null> {
    try {
        console.log('=== FETCHING USER PROFILE ===');
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/snake/profile`);

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        return data;
    } catch (error) {
        console.log('Error fetching profile', error);
        return null;
    }
}

function updateProfileDisplay(profile: ProfileSnake): void {
    // Mettre à jour l'avatar
    const avatarContainer = document.getElementById('avatar-container');
    if (avatarContainer && profile.user.avatar) {
        avatarContainer.innerHTML = `<img src="data:image/jpeg;base64,${profile.user.avatar}" class="w-full h-full object-cover" alt="Avatar">`;
    }

    // Maj le nom
    const displayName = document.getElementById('profile-display-name');
    if (displayName) {
        displayName.textContent = profile.user.nickName;
    }

    // Maj le username
    const username = document.getElementById('profile-username');
    if (username) {
        username.textContent = `@${profile.user.login}`;
    }

    // Maj les statistiques
    const stats = [
        {
            id: 'classement',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.ranking.toString()
        },
        {
            id: 'max-size',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.maxSize.toString()
        },
        {
            id: 'average-size',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.averageSize.toString()
        },
        {
            id: 'eaten-apples',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.eatenApples.toString()
        }
    ];

    stats.forEach(stat => {
        const element = document.querySelector(`[data-stat="${stat.id}"]`);
        if (element) {
            element.textContent = stat.value.toString();
        }
    });
}

// export async function updateUserProfile(): Promise<void> {
//     try {

//         const profile = await fetchUserProfile();
//         if (profile) {
//             updateProfileDisplay(profile);
//         }
//     } catch (error) {
//         console.error('Error updating profile:', error);
//     }
// }


// export async function updateUserProfile(): Promise<void> {
//     try {
//         // Vérifier si on regarde le profil d'un autre utilisateur
//         const targetUserId = document.querySelector('.content-section')?.getAttribute('data-target-user');

//         let profileUrl = '/api/snake/profile';
//         if (targetUserId) {
//             profileUrl = `/api/snake/profile/${targetUserId}`;
//         }

//         const profile = await fetchUserProfile(profileUrl);
//         if (profile) {
//             updateProfileDisplay(profile);
//         }
//     } catch (error) {
//         console.error('Error updating profile:', error);
//     }
// } TO DO 