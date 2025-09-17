import { ChatSingleton } from '../chat';
// Afficher le bouton de chat après connexion

export async function displayChatButton() {
    // Vérifier si le bouton n'existe pas déjà
    if (document.getElementById('chat-fab')) {
        // console.log('Bouton chat déjà présent');
        return;
    }
    
    // console.log('✅ Création du bouton chat après connexion');
    const { ChatFloatingButton } = await import('../chat/components');
    document.body.insertAdjacentHTML('beforeend', ChatFloatingButton());
    
    // Initialiser le chat immédiatement (connexion Socket.IO, état initial)
    const chatInstance = ChatSingleton.getInstance();
    if (chatInstance) {
        chatInstance.Manager.startChat();
    } else {
        console.log('Erreur lors de l\'initialisation du chat');
        return;
    }
    // Le bouton ne fait que toggle l'interface (ouvrir/fermer le panel)
    const chatFab = document.getElementById('chat-fab');
    if (chatFab) {
        chatFab.addEventListener('click', () => {
            chatInstance.Manager.toggleChat();
        });
    }
}

// Masquer le bouton de chat après déconnexion
export function hideChatButton() {
	const chatButton = document.getElementById('chat-fab');
	const chatPanel = document.getElementById('chat-panel');
	
	if (chatButton) {
		chatButton.remove();
		// console.log('❌ Bouton chat supprimé après déconnexion');
	}
	
	if (chatPanel) {
		chatPanel.remove();
	}
}
