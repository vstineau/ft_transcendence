// Afficher le bouton de chat après connexion
export async function displayChatButton() {
	// Vérifier si le bouton n'existe pas déjà
	if (document.getElementById('chat-fab')) {
		console.log('Bouton chat déjà présent');
		return;
	}
	
	console.log('✅ Création du bouton chat après connexion');
	const { ChatFloatingButton } = await import('../views/chat.views');
	document.body.insertAdjacentHTML('beforeend', ChatFloatingButton());
	
	// Initialiser le chat
	const { chatManager } = await import('../chat/chat');
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