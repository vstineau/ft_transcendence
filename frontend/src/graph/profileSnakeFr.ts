import { SnakeGameHistory, ProfileSnake } from '../types/snakeTypes';
import { navigateTo, authenticatedFetch} from '../main';
import { formatGameTime, formatDate } from '../graph/init';

async function fetchUserProfile(targetUserId?: string): Promise<ProfileSnake | null> {
    try {
        // console.log('=== FETCHING USER PROFILE ===');
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        let url = `${protocol}//${host}:${port}/api/snake/profile`;
        if (targetUserId) {
            url = `${protocol}//${host}:${port}/api/snake/profile/${targetUserId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        // console.log('Profile data received:', data);
        return data;
    } catch (error) {
        // console.log('Error fetching profile', error);
        return null;
    }
}


function updateProfileDisplay(profile: ProfileSnake): void {
    // Mettre à jour l'avatar
    // console.log('🔥 updateProfileDisplay called with:', profile.user.nickName, profile.user.login);

    // Vérifiez que ces éléments existent
    const avatarContainer = document.getElementById('avatar-container');
    const displayName = document.getElementById('profile-display-name');
    const username = document.getElementById('profile-username');

    // console.log('Elements found:', {
    //     avatarContainer: !!avatarContainer,
    //     displayName: !!displayName,
    //     username: !!username
    // });

    if (avatarContainer && profile.user.avatar) {
        let avatarSrc = profile.user.avatar;
        if (!avatarSrc.startsWith('data:')) {
            avatarSrc = `data:image/jpeg;base64,${avatarSrc}`;
        }
        avatarContainer.innerHTML = `<img src="${avatarSrc}" class="w-full h-full object-cover" alt="Avatar">`;
        // console.log('Avatar updated');
    }

    if (displayName) {
        displayName.textContent = profile.user.nickName;
        // console.log('Display name updated to:', profile.user.nickName);
    }

    if (username) {
        username.textContent = `@${profile.user.login}`;
        // console.log('Username updated to:', profile.user.login);
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
    // console.log('✅ Profile display updated successfully');

}

export async function updateUserProfile(): Promise<void> {
    try {
        // console.log('=== DEBUG UPDATE USER PROFILE ===');
        // console.log('Current URL:', window.location.href);
        // console.log('Search params:', window.location.search);

        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = urlParams.get('user');
        // console.log('Target user ID extracted:', targetUserId);

        const profile = await fetchUserProfile(targetUserId || undefined);
        if (profile) {
            updateProfileDisplay(profile);
        }
    } catch (error) {
        console.warn('Error updating profile:', error);
    }
}
