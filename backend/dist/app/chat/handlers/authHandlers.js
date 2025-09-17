import { User } from '../../models.js';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { CHAT_CONFIG, CHAT_EVENTS } from '../config/chatConfig.js';
import { buildFriendList } from './friendHandlers.js';
import { usersOnlineGauge } from '../../monitoring/metrics.js';
export async function handleInitUser(socket, token, app, chatNamespace) {
    try {
        if (!token) {
            socket.emit(CHAT_EVENTS.AUTH_ERROR, 'No token provided');
            console.log('No token provided on chat initUser');
            return;
        }
        const payload = app.jwt.verify(token);
        const user = await User.findOneBy({ login: payload.login });
        if (!user) {
            socket.emit(CHAT_EVENTS.AUTH_ERROR, 'User not found');
            console.log('User not found on chat initUser');
            return;
        }
        await userService.setUserOnline(user.id, true);
        const chatUser = userService.createChatUser(user, socket.id);
        userService.addUser(socket.id, chatUser);
        socket.join(CHAT_CONFIG.ROOMS.GLOBAL);
        socket.join(CHAT_CONFIG.ROOMS.PONG);
        socket.join(CHAT_CONFIG.ROOMS.SNAKE);
        const recentMessages = await messageService.getRecentMessages(CHAT_CONFIG.ROOMS.GLOBAL);
        const friendList = await buildFriendList(user.id);
        const blockedList = user.blocklist || [];
        socket.emit(CHAT_EVENTS.USER_CONNECTED, {
            user: chatUser,
            onlineUsers: userService.getAllUsers(),
            recentMessages,
            friendList,
            blockedList
        });
        socket.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.USER_JOINED, chatUser);
        chatNamespace.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.ONLINE_USERS_UPDATED, userService.getAllUsers());
        app.log.info(`Chat user connected: ${user.login}`);
        try {
            usersOnlineGauge.set({ service: 'chat' }, userService.getAllUsers().length);
        }
        catch { }
    }
    catch (error) {
        app.log.error('Chat auth error:', error);
        socket.emit(CHAT_EVENTS.AUTH_ERROR, 'Invalid token');
    }
}
//# sourceMappingURL=authHandlers.js.map