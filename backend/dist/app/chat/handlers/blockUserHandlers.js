import { CHAT_EVENTS } from '../config/chatConfig.js';
import { User } from '../../models.js';
export async function handleBlockUser(socket, data, app) {
    const blocked = data.targetUserId;
    try {
        const user = await User.findOneBy({ id: data.currentUserId });
        if (user) {
            if (user.blocklist && user.blocklist.includes(blocked)) {
                user.blocklist = user.blocklist.filter(id => id !== blocked);
                await User.save(user);
                socket.emit(CHAT_EVENTS.USER_DEBLOCKED, { targetUserId: blocked });
                return;
            }
            else {
                user.blocklist = user.blocklist ? [...user.blocklist, blocked] : [blocked];
                await User.save(user);
                socket.emit(CHAT_EVENTS.USER_BLOCKED, { targetUserId: blocked });
                return;
            }
        }
    }
    catch (error) {
        app.log.error('Error blocking user:', error);
        socket.emit(CHAT_EVENTS.ERROR, 'Error blocking user');
    }
}
//# sourceMappingURL=blockUserHandlers.js.map