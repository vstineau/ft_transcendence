import { ChatManager } from '../ChatManager';
import { CHAT_EVENTS } from '../config';
import { ChatRoom } from '../types';

export function eventsRooms(this: ChatManager) {

		// [ANIMATION] Chargement des messages pour une room spécifique
        //this.on(CHAT_EVENTS.LOADING_MESSAGES, (data: any) => {
        //    console.log(`⏳ Chargement des messages pour room ${data.room}:`, data.message);
        //    (this as any).showLoadingMessage(data.room, data.message);
        //});

		// Réception de l'historique des messages pour une room spécifique
        this.on(CHAT_EVENTS.MESSAGE_HISTORY, (data: any) => {
            // console.log(`📨 Messages reçus pour room ${data.room}:`, data.messages);
            const room = data.room;
            const messages = data.messages || [];

            if (room === (this as any).currentRoom?.id) {
                (this as any).currentRoom.messages = messages;
            }
            // Cacher le message de chargement
            (this as any).hideLoadingMessage();
            
            // Remplacer les messages actuels par ceux de la room
            //(this as any).currentRoom?.messages = data.messages || [];

            // Mettre à jour l'affichage
            (this as any).updateMessagesDisplay();
        });

        // Écouter la confirmation de rejoindre une room privée
        this.on(CHAT_EVENTS.ROOM_JOINED, (data: any) => {
            // console.log(`✅ Room private rejointe: ${data.roomName}`, data.messages);
            
            //// Mettre à jour les messages avec l'historique de la room privée
            //this.messages = data.messages || [];
            if ((this as any).currentRoom?.messages.length === 0) {
                (this as any).updateMessagesDisplay();
            }
        });

        // Écouter la création automatique d'une room privée par quelqu'un d'autre
        this.on(CHAT_EVENTS.PRIVATE_ROOM_CREATED, (data: any) => {
            // console.log(`🔔 Room privée créée par ${data.withUser.username}:`, data.roomName);
            
            // Créer la room dans l'interface si elle n'existe pas
            const existingRoom = (this as any).rooms?.find((r: any) => r.id === data.roomName);
            if (!existingRoom) {
                const newRoom: ChatRoom = {
                    id: data.roomName,
                    name: data.withUser.username,
                    type: 'private',
                    messages: data.messages || [],
                    participants: [(this as any).state.currentUserId?.id, data.withUser.id],
                    unreadCount: 0
                };

				if (!(this as any).rooms) (this as any).rooms = [];
                (this as any).rooms.push(newRoom);
                
                // console.log(`✅ Room privée ajoutée automatiquement: ${data.roomName} avec ${data.withUser.username}`);
                
                // Mettre à jour l'affichage des rooms
                (this as any).renderSidebar();
            }
        });

}