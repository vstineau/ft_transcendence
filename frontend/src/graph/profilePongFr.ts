
import { PongGameHistory, ProfilePong } from '../types/pongTypes';
import { formatGameTime, formatDate } from '../graph/init';

async function fetchUserProfile(): Promise<ProfilePong | null> {
    try {
        console.log('=== FETCHING USER PROFILE ===');
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/pong/profile`);

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

function updateProfileDisplay(profile: ProfilePong): void {
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
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.maxSpeed.toString()
        },
        {
            id: 'average-size',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.averageSpeed.toString()
        },
        {
            id: 'eaten-apples',
            value: profile.stats.totalGames === 0 ? '-' : profile.stats.totalGoalScored.toString()
        }
    ];

    stats.forEach(stat => {
        const element = document.querySelector(`[data-stat="${stat.id}"]`);
        if (element) {
            element.textContent = stat.value.toString();
        }
    });
}

export async function updateUserProfile(): Promise<void> {
    try {
        const profile = await fetchUserProfile();
        if (profile) {
            updateProfileDisplay(profile);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}


