import { escapeHtml } from '../utils';

/**
 * Bouton flottant de chat
 */
export function ChatFloatingButton(): string {
    return /* HTML */ `
        <button
            id="chat-fab"
            class="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-colors duration-200 z-50 font-montserrat"
            aria-label="Ouvrir le chat"
        >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span id="chat-notif" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg min-w-[20px] h-5 flex items-center justify-center">
                3
            </span>
        </button>
    `;
}
