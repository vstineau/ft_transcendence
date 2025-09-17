import { User } from '../chat/types';
import { ChatSingleton } from '../chat';


let chatInstance = ChatSingleton.getInstance();

async function fetchRecentContacts(): Promise<User[]> {
    try {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        const response = await fetch(`${protocol}//${host}:${port}/api/chat/recent-contacts`);

        if (!response.ok) {
            throw new Error('Failed to fetch recent contacts');
        }
		const data = await response.json();
		// console.log('Raw API response:', data);

		 return data.map((contact: any) => ({
            id: contact.id,
            username: contact.login, // ou contact.nickName selon vos préférences
            avatar: contact.avatar,
            status: contact.status
        } as User), console.log('Mapped contacts:', data));
        // return await response.json();
    } catch (error) {
        console.log('Error fetching recent contacts:', error);
        return [];
    }
}

function generateContactHTML(contacts: User[]): string {
    // console.log('Number of contacts:', contacts.length);

    // Garder uniquement les personnes connectées (online ou en jeu)
    const connected = contacts.filter(c => c.status === 'online' || c.status === 'in-game');

    if (connected.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center w-full text-center py-4">
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-700 mb-2">No online users</h4>
                    <p class="text-sm text-gray-500 mb-2">Invite friends or join the global chat!</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" onclick="openGlobalChat()">
                    Join Global Chat
                </button>
            </div>
        `;
    }

    // Limiter à 3 contacts maximum parmi les connectés
    const displayContacts = connected.slice(0, 3);

    return displayContacts.map((contact, index) => {
        let avatarContent;
        if (contact.avatar && contact.avatar.length > 0) {
            const imgSrc = contact.avatar.startsWith('data:')
                ? contact.avatar
                : `data:image/jpeg;base64,${contact.avatar}`;

            avatarContent = `<img src="${imgSrc}"
                class="w-32 h-32 object-cover rounded-xl"
                alt="Avatar"
                onerror="console.log('Image failed to load'); this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold" style="display:none;">
                ${contact.username.charAt(0).toUpperCase()}
            </div>`;
        } else {
            avatarContent = `<div class="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold">
                ${contact.username.charAt(0).toUpperCase()}
            </div>`;
        }

    const statusClass = contact.status === 'online' ? 'bg-green-500' : (contact.status === 'in-game' ? 'bg-blue-500' : 'bg-gray-400');

        return `
            <div class="text-center cursor-pointer hover:opacity-80 transition-opacity" onclick="openChat('${contact.id}')">
                <div class="relative">
                    ${avatarContent}
                    <div class="w-3 h-3 ${statusClass} rounded-full absolute -top-1 -right-1"></div>
                </div>
                <span class="text-xs text-gray-600">@${contact.username}</span>
            </div>
        `;
    }).join('');
}

export async function updateRecentContacts(): Promise<void> {
    try {
        const contacts = await fetchRecentContacts();
        // console.log('Fetched contacts:', contacts);
        const contactsContainer = document.getElementById('recent-contacts-container');

        if (contactsContainer) {
            console.warn('Updating recent contacts container');
            contactsContainer.innerHTML = generateContactHTML(contacts);
        }
    } catch (error) {
        console.log('Error updating recent contacts:', error);
    }
}

function openChat(userId: string): void {
    // Rediriger vers le chat ou ouvrir une modal
    // console.log('Opening chat with user:', userId);
    chatInstance.Manager.openChat();
    chatInstance.Manager.startPrivateChat(userId);
}

function openGlobalChat(): void {
    // console.log('Opening global chat');
    chatInstance.Manager.openChat();
    chatInstance.Manager.switchRoom('global');
    // window.location.href = '/chat';
}

declare global {
    interface Window {
        openChat: (userId: string) => void;
		openGlobalChat: () => void;
    updateRecentContacts?: () => Promise<void>;
    }
}

window.openChat = openChat; //c'est lie a ca
window.openGlobalChat = openGlobalChat;
window.updateRecentContacts = updateRecentContacts;
