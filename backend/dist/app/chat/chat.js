import { messageService } from './services/messageService.js';
import { handleInitUser } from './handlers/authHandlers.js';
import { handleSendMessage, handleGetMessageHistory } from './handlers/messageHandlers.js';
import { handleJoinPrivateRoom } from './handlers/roomHandlers.js';
import { handleGameInvitation, handleGameInvitationResponse, handleStatusChange } from './handlers/gameHandlers.js';
import { handleDisconnect, handleSocketError } from './handlers/connectionHandlers.js';
import { handleAddFriend, handleDeleteFriend } from './handlers/friendHandlers.js';
import { handleBlockUser } from './handlers/blockUserHandlers.js';
import { CHAT_CONFIG, CHAT_EVENTS } from './config/chatConfig.js';
export async function startChat(app) {
    const chatNamespace = app.io.of('/chat');
    chatNamespace.on('connection', (socket) => {
        app.log.info({ id: socket.id }, 'Chat client connected');
        socket.on(CHAT_EVENTS.INIT_USER, async (token) => {
            await handleInitUser(socket, token, app, chatNamespace);
        });
        socket.on(CHAT_EVENTS.SEND_MESSAGE, (data) => handleSendMessage(socket, data, app, chatNamespace));
        socket.on(CHAT_EVENTS.GET_MESSAGE_HISTORY, (data) => handleGetMessageHistory(socket, data, app));
        socket.on(CHAT_EVENTS.DELETE_MESSAGE, (data) => {
            messageService.deleteMessage(data.messageId);
        });
        socket.on(CHAT_EVENTS.JOIN_PRIVATE_ROOM, (data) => handleJoinPrivateRoom(socket, data, app));
        socket.on(CHAT_EVENTS.JOIN_PUBLIC_ROOM, (data) => {
            console.log(`🔄 Rejoindre la room publique: ${data.room}`);
            socket.join(data.room);
        });
        socket.on(CHAT_EVENTS.ADD_FRIEND, (data) => handleAddFriend(socket, data, app));
        socket.on(CHAT_EVENTS.DELETE_FRIEND, (data) => handleDeleteFriend(socket, data, app));
        socket.on(CHAT_EVENTS.BLOCK_USER, (data) => {
            handleBlockUser(socket, data, app);
            console.log(`🔒 Bloquer l'utilisateur: ${data.targetUserId}`);
        });
        socket.on(CHAT_EVENTS.UNBLOCK_USER, (data) => {
            handleBlockUser(socket, data, app);
            console.log(`🔓 Débloquer l'utilisateur: ${data.targetUserId}`);
        });
        socket.on(CHAT_EVENTS.GAME_INVITATION, (data) => handleGameInvitation(socket, data, chatNamespace));
        socket.on(CHAT_EVENTS.GAME_INVITATION_RESPONSE, (data) => handleGameInvitationResponse(socket, data));
        socket.on(CHAT_EVENTS.STATUS_CHANGE, (data) => {
            handleStatusChange(socket, data, chatNamespace);
        });
        socket.on('disconnect', () => handleDisconnect(socket, app, chatNamespace));
        socket.on(CHAT_EVENTS.ERROR, (error) => handleSocketError(error, app));
    });
    setInterval(() => {
        messageService.cleanupOldMessages();
    }, CHAT_CONFIG.CLEANUP_INTERVAL);
    app.log.info('Chat service initialized');
}
//# sourceMappingURL=chat.js.map