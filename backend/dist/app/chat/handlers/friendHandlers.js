import { User } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
import { In } from 'typeorm';
import { userService } from '../services/userService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';
export async function handleAddFriend(socket, data, app) {
    try {
        const requester = userService.getUser(socket.id);
        if (!requester) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Not authenticated');
            return;
        }
        const repo = SqliteDataSource.getRepository(User);
        const me = await repo.findOne({ where: { id: requester.id } });
        const target = await repo.findOne({ where: { id: data.targetUserId } });
        if (!me || !target) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'User not found');
            return;
        }
        if ((target.blocklist || []).includes(me.id)) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'User has blocked you');
            return;
        }
        const myFriends = me.friends || [];
        if (myFriends.includes(target.id)) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Already in your friend list');
            return;
        }
        me.friends = [...myFriends, target.id];
        await repo.save(me);
        const payload = {
            id: target.id,
            login: target.login,
            nickName: target.nickName,
            avatar: target.avatar || '',
            status: target.isOnline ? 'online' : 'offline'
        };
        socket.emit(CHAT_EVENTS.FRIEND_ADDED, payload);
        const friends = await buildFriendList(me.id);
        socket.emit(CHAT_EVENTS.FRIEND_LIST_UPDATED, friends);
    }
    catch (err) {
        app.log.error('handleAddFriend error', err);
        socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Failed to add friend');
    }
}
export async function buildFriendList(userId) {
    const repo = SqliteDataSource.getRepository(User);
    const me = await repo.findOne({ where: { id: userId } });
    const ids = me?.friends || [];
    if (ids.length === 0)
        return [];
    const users = await repo.find({ where: { id: In(ids) } });
    return users.map((u) => ({
        id: u.id,
        username: u.nickName || u.login,
        avatar: u.avatar || '',
        status: u.isOnline ? 'online' : 'offline'
    }));
}
export async function handleDeleteFriend(socket, data, app) {
    try {
        if (!data?.currentUserId || !data?.targetUserId) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Missing currentUserId: ' + data?.currentUserId + ' or targetUserId: ' + data?.targetUserId);
            return;
        }
        const repo = SqliteDataSource.getRepository(User);
        const me = await repo.findOne({ where: { id: data.currentUserId } });
        if (!me) {
            socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'User not found');
            return;
        }
        const myFriends = me.friends || [];
        me.friends = myFriends.filter((id) => id !== data.targetUserId);
        await repo.save(me);
        const friends = await buildFriendList(me.id);
        socket.emit(CHAT_EVENTS.FRIEND_LIST_UPDATED, friends);
    }
    catch (err) {
        app.log.error('handleDeleteFriend error', err);
        socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Failed to delete friend');
    }
}
//# sourceMappingURL=friendHandlers.js.map