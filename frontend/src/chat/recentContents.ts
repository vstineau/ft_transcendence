import { User } from '../chat/types';
import { chatManager } from '../chat';


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
        console.log('Raw API response:', data);

        return data.map((contact: any) => ({
            id: contact.id,
            username: contact.login, // ou contact.nickName selon vos préférences
            avatar: contact.avatar,
            status: contact.status
        } as User));
        // return await response.json();
    } catch (error) {
        console.error('Error fetching recent contacts:', error);
        return [];
    }
}

// On ne crée pas un second socket; on utilise l'instance unique de chatManager

function generateContactHTML(contacts: User[]): string {
    console.log('Number of contacts:', contacts.length);

    if (contacts.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center w-full text-center py-4">
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-700 mb-2">No recent chats</h4>
                    <p class="text-sm text-gray-500 mb-2">Start a conversation with other players!</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" onclick="openGlobalChat()">
                    Join Global Chat
                </button>
            </div>
        `;
    }

    // Limiter à 3 contacts maximum
    const displayContacts = contacts.slice(0, 3);

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

        const statusClass = contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400';

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
        const contactsContainer = document.getElementById('recent-contacts-container');

        if (contactsContainer) {
            contactsContainer.innerHTML = generateContactHTML(contacts);
        }
    } catch (error) {
        console.error('Error updating recent contacts:', error);
    }
}

// Petits helpers accessibles depuis le dashboard (onclick)
function openChat(userId: string): void {
    chatManager.openPrivateChat(userId);
}

function openGlobalChat(): void {
    chatManager.openChat();
    chatManager.openGlobalChat();
}

// Exposer explicitement pour l’HTML inline
// @ts-ignore
window.openChat = openChat as any;
// @ts-ignore
window.openGlobalChat = openGlobalChat as any;
