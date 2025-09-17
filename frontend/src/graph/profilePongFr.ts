
import { ProfilePong } from '../types/pongTypes';

// async function fetchUserProfilePong(): Promise<ProfilePong | null> {
// 	try {
// 		console.log('=== FETCHING USER PROFILE ===');
// 		const host = window.location.hostname;
// 		const port = window.location.port;
// 		const protocol = window.location.protocol;

// 		const response = await fetch(`${protocol}//${host}:${port}/api/pong/profile`);

// 		if (!response.ok) {
// 			throw new Error('Failed to fetch profile');
// 		}

// 		const data = await response.json();
// 		console.log('Profile data received:', data);
// 		return data;
// 	} catch (error) {
// 		console.log('Error fetching profile', error);
// 		return null;
// 	}
// }

async function fetchUserProfilePong(targetUserId?: string): Promise<ProfilePong | null> {
	try {
		// console.log('=== FETCHING USER PROFILE ===');
		const host = window.location.hostname;
		const port = window.location.port;
		const protocol = window.location.protocol;
		
		let url = `${protocol}//${host}:${port}/api/pong/profile`;
		if (targetUserId) {
			url = `${protocol}//${host}:${port}/api/pong/profile/${targetUserId}`;
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

function updateProfileDisplayPong(profile: ProfilePong): void {
	// Mettre à jour l'avatar
	const avatarContainer = document.getElementById('avatar-container');
	// if (avatarContainer && profile.user.avatar) {
	// 	avatarContainer.innerHTML = `<img src="data:image/jpeg;base64,${profile.user.avatar}" class="w-full h-full object-cover" alt="Avatar">`;
	// }
	if (avatarContainer && profile.user.avatar) {
        let avatarSrc = profile.user.avatar;
        if (!avatarSrc.startsWith('data:')) {
            avatarSrc = `data:image/jpeg;base64,${avatarSrc}`;
        }
        avatarContainer.innerHTML = `<img src="${avatarSrc}" class="w-full h-full object-cover" alt="Avatar">`;
        // console.log('Avatar updated');
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

	const stats = [
		{
			id: 'classement',
			value: profile.stats.totalGames === 0 ? '-' : profile.stats.ranking.toString()
		},
		{
			id: 'max-speed',
			value: profile.stats.totalGames === 0 ? '-' : profile.stats.maxSpeed.toString()
		},
		{
			id: 'average-speed',
			value: profile.stats.totalGames === 0 ? '-' : profile.stats.averageSpeed.toString()
		},
		{
			id: 'total-goals',
			value: profile.stats.totalGames === 0 ? '-' : profile.stats.totalGoals.toString()
		}
	];

	stats.forEach(stat => {
		const element = document.querySelector(`[data-stat="${stat.id}"]`);
		if (element) {
			element.textContent = stat.value.toString();
		}
	});
}

export async function updateUserProfilePong(): Promise<void> {
	try {
		// console.log('=== DEBUG UPDATE USER PROFILE ===');
		// console.log('Current URL:', window.location.href);
		// console.log('Search params:', window.location.search);
		
		const urlParams = new URLSearchParams(window.location.search);
		const targetUserId = urlParams.get('user');
		// console.log('Target user ID extracted:', targetUserId);
		
		const profile = await fetchUserProfilePong(targetUserId || undefined);
		if (profile) {
			updateProfileDisplayPong(profile); // ← Rajoutez cette ligne !
		}
	} catch (error) {
		console.warn('Error updating profile:', error);
	}
}