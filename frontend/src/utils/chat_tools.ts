// Afficher le bouton de chat après connexion
export async function displayChatButton() {
    // Vérifier si le bouton n'existe pas déjà
    if (document.getElementById('chat-fab')) {
        console.log('Bouton chat déjà présent');
        return;
    }
    
    console.log('✅ Création du bouton chat après connexion');
    const { ChatFloatingButton } = await import('../chat/components');
    document.body.insertAdjacentHTML('beforeend', ChatFloatingButton());
    
    // NE PAS initialiser le chat ici - le faire au clic du bouton
    const chatFab = document.getElementById('chat-fab');
    if (chatFab) {
        chatFab.addEventListener('click', async () => {
            const { chatManager } = await import('../chat');
            // Le chat s'initialise seulement quand on clique
        });
    }
}

// Masquer le bouton de chat après déconnexion
export function hideChatButton() {
	const chatButton = document.getElementById('chat-fab');
	const chatPanel = document.getElementById('chat-panel');
	
	if (chatButton) {
		chatButton.remove();
		console.log('❌ Bouton chat supprimé après déconnexion');
	}
	
	if (chatPanel) {
		chatPanel.remove();
	}
}
