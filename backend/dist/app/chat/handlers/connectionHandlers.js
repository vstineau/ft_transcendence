import { userService } from '../services/userService.js';
import { CHAT_CONFIG, CHAT_EVENTS } from '../config/chatConfig.js';
import { usersOnlineGauge } from '../../monitoring/metrics.js';
export async function handleDisconnect(socket, app, chatNamespace) {
    const user = userService.removeUser(socket.id);
    if (user) {
        try {
            await userService.setUserOnline(user.id, false);
        }
        catch (error) {
            app.log.error('Error updating user offline status:', error);
        }
        socket.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.USER_LEFT, user);
        chatNamespace.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.ONLINE_USERS_UPDATED, userService.getAllUsers());
        try {
            usersOnlineGauge.set({ service: 'chat' }, userService.getAllUsers().length);
        }
        catch { }
    }
}
export function handleSocketError(error, app) {
    app.log.error('Chat socket error:', error);
}
//# sourceMappingURL=connectionHandlers.js.map