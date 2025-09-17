import { ChatManager } from '../../chat';
import { CHAT_EVENTS } from '../config';

export function eventsMessages(this: ChatManager) {

	this.on(CHAT_EVENTS.NEW_MESSAGE, (message: any) => {
	    //console.log('📩 New message received:', message);
		const isBlocked = (this as any).state.currentUserId.blockedList.includes(message.userId) || message.blockedList.includes((this as any).state.currentUserId.id);

	    // Si c'est un message privé, gérer côté client
		if (message.roomId?.startsWith('private_')) {
				if (isBlocked) {
					(this as any).emit(CHAT_EVENTS.DELETE_MESSAGE, { messageId: message.id });
					return;
				}

				const isOwn = message.userId === (this as any).state.currentUserId?.id;

				if (!isOwn) {
					// Message privé reçu - créer la room si nécessaire
					(this as any).createAndShowPrivateRoom(message);
				} else {
					// Message privé envoyé par nous - notifier le serveur une seule fois pour créer/joindre côté distant
					(this as any).handleOutgoingPrivateMessage(message);
				}

				// Dans tous les cas, stocker le message et mettre à jour l'UI de manière incrémentale si on est dans la bonne room
				(this as any).addMessage(message);
				const currentRoom = (this as any).currentRoom?.id || (this as any).state?.activeTab;
				if (message.roomId === currentRoom) {
					(this as any).appendMessageToDom(message);
				} else {
					// Incrémenter les non-lus si le chat est fermé OU si pas dans la bonne room
					if (!(this as any).state.isOpen || message.roomId !== currentRoom) {
						// compteur par room
						if (message.roomId) {
							(this as any).incrementUnread(message.roomId);
							// recalcul du global à partir de la somme des rooms
							(this as any).state.unreadCount = (this as any).getTotalUnread();
							(this as any).updateNotificationBadge();
							(this as any).renderRoomsList();
						}
					}
				}
				return;
			}

		// Si l'utilisateur n'est pas bloqué, afficher le message dans les salons publics
		if (!isBlocked) {
			// Vérifier si le message appartient à la room active
			this.addMessage(message);
			const currentRoom = (this as any).currentRoom?.id || (this as any).state?.activeTab;
			if (message.roomId === currentRoom) {
				// Append incrémental au lieu d'un full re-render
				(this as any).appendMessageToDom(message);
			}

			// Incrémenter les non-lus si le chat est fermé OU si pas dans la bonne room
			if (!(this as any).state.isOpen || message.roomId !== currentRoom) {
				if (message.roomId) {
					(this as any).incrementUnread(message.roomId);
					(this as any).state.unreadCount = (this as any).getTotalUnread();
					(this as any).updateNotificationBadge();
					(this as any).renderRoomsList();
				}
			}
		}
	});

	// Invitation de jeu reçue: afficher dans le flux comme un message spécial
	this.on(CHAT_EVENTS.GAME_INVITATION_RECEIVED, (payload: any) => {
		const from = payload.from || {};
		const inviterId = from.id;
		const inviterName = from.nickName || from.login || 'Invitation';
		const inviterAvatar = from.avatar || '';
		const targetSocketId = from.socketId || '';
		const me = (this as any).state.currentUserId?.id;
		if (!inviterId || !me) return;

		// Déterminer la room privée dédiée
		const privateRoomId = (this as any).createPrivateRoomId(inviterId, me);
		// Créer la room privée si elle n'existe pas encore côté client
		let room = (this as any).rooms?.find((r: any) => r.id === privateRoomId);
		if (!room) {
			const newRoom: any = {
				id: privateRoomId,
				name: inviterName,
				type: 'private',
				participants: [inviterId, me],
				messages: [],
				unreadCount: 0
			};
			if (!(this as any).rooms) (this as any).rooms = [];
			(this as any).rooms.push(newRoom);
			(this as any).renderRoomsList();
		}

		const msg: any = {
			id: payload.invitationId || `invite_${Date.now()}`,
			userId: inviterId,
			username: inviterName,
			content: '',
			avatarPath: inviterAvatar,
			timestamp: new Date().toISOString(),
			type: 'game-invitation',
			roomId: privateRoomId,
			p1: inviterId,
			p2: me,
			targetSocketId
		};
		(this as any).addMessage(msg);
		const currentRoom = (this as any).currentRoom?.id || (this as any).state?.activeTab;
		if (msg.roomId === currentRoom) {
			(this as any).appendMessageToDom(msg);
		} else {
			// Marquer non lu dans la room privée concernée
			(this as any).incrementUnread(privateRoomId);
			(this as any).state.unreadCount = (this as any).getTotalUnread();
			(this as any).updateNotificationBadge();
			(this as any).renderRoomsList();
		}
	});

	// Réponse à invitation: si acceptée, rediriger les deux clients
	this.on(CHAT_EVENTS.GAME_INVITATION_ANSWER, (data: { invitationId: string; accepted: boolean; url?: string; from?: any }) => {
		(this as any).handleInvitationAnswer(data);
		// je change le status des users en in-game
		let status;
		if (data.accepted) {
			status = 'in-game';
		} else {
			status = 'online';
		}
		(this as any).emit(CHAT_EVENTS.STATUS_CHANGE, { userId: (this as any).state.currentUserId.id, status });
	});

}