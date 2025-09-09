import { ChatManager } from '../ChatManager';
//import { Message } from '../types';

export function eventsMessages(this: ChatManager) {

	this.on('newMessage', (message: any) => {
	    console.log('📩 New message received:', message);

	    // Si c'est un message privé, gérer côté client
	    if (message.roomId?.startsWith('private_')) {
			// checker si l'utilisateur est bloqué

			if ((this as any).state.currentUserId.blockedList.includes(message.userId)) {
				console.log('🚫 Message from blocked user ignored:', message.userId);
				// envoyer un message systeme à l'utilisateur
				return;
			}

			if (message.userId !== (this as any).state.currentUserId?.id) {
				// Message privé reçu - créer/afficher la room automatiquement
	            (this as any).createAndShowPrivateRoom(message);

	        } else {
				// Message privé envoyé par nous - s'assurer que la room existe côté serveur
	            (this as any).handleOutgoingPrivateMessage(message);
	        }
	    }
		
	    // Vérifier si le message appartient à la room active
	    const currentRoom = (this as any).currentRoom?.id || (this as any).state?.activeTab;
	    if (message.roomId === currentRoom) {
			//this.addMessage(message);
	        this.messages.push(message);
	        (this as any).updateMessagesDisplay();
	    }

	    // Incrémenter les non-lus si le chat est fermé OU si pas dans la bonne room
	    if (!(this as any).state.isOpen || message.roomId !== currentRoom) {
	        (this as any).state.unreadCount++;
	        (this as any).updateNotificationBadge();
	    }

	});




}