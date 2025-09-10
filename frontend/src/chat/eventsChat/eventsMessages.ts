import { ChatManager } from '../ChatManager';
//import { Message } from '../types';

export function eventsMessages(this: ChatManager) {

	this.on('newMessage', (message: any) => {
	    console.log('📩 New message received:', message);
		const isBlocked = (this as any).state.currentUserId.blockedList.includes(message.userId) || message.blockedList.includes((this as any).state.currentUserId.id);
		console.log('isBlocked:', isBlocked);
		console.log('Current user ID:', (this as any).state.currentUserId.id);
		console.log('Blocked list:', (this as any).state.currentUserId.blockedList);
		console.log('Message user ID:', message.userId);

	    // Si c'est un message privé, gérer côté client
	    if (message.roomId?.startsWith('private_')) {
			if (isBlocked) {
				// (this as any).emit('deleteMessage', message.id); // demander au serveur de supprimer le message
				return ;
			}
			if (message.userId !== (this as any).state.currentUserId?.id) {
				// Message privé reçu - créer/afficher la room automatiquement
	            (this as any).createAndShowPrivateRoom(message);
				return ;

	        } else {
				// Message privé envoyé par nous - s'assurer que la room existe côté serveur
	            (this as any).handleOutgoingPrivateMessage(message);
				return ;
	        }
	    }

		// Si l'utilisateur n'est pas bloqué, afficher le message dans les salons publics
		if (!isBlocked) {
			// Vérifier si le message appartient à la room active
			this.addMessage(message);
			const currentRoom = (this as any).currentRoom?.id || (this as any).state?.activeTab;
			if (message.roomId === currentRoom) {
				(this as any).updateMessagesDisplay();
			}

			// Incrémenter les non-lus si le chat est fermé OU si pas dans la bonne room
			if (!(this as any).state.isOpen || message.roomId !== currentRoom) {
				(this as any).state.unreadCount++;
				(this as any).updateNotificationBadge();
			}
		}
	});

}