import { User } from '../../models.js';
class UserService {
    connectedUsers = new Map();
    addUser(socketId, user) {
        this.connectedUsers.set(socketId, user);
    }
    removeUser(socketId) {
        const user = this.connectedUsers.get(socketId);
        if (user) {
            this.connectedUsers.delete(socketId);
        }
        return user;
    }
    getUser(socketId) {
        return this.connectedUsers.get(socketId);
    }
    getAllUsers() {
        return Array.from(this.connectedUsers.values());
    }
    findUserById(userId) {
        return Array.from(this.connectedUsers.values())
            .find(u => u.id === userId);
    }
    updateUserStatus(socketId, status) {
        const user = this.connectedUsers.get(socketId);
        if (user) {
            user.status = status;
            this.connectedUsers.set(socketId, user);
            return true;
        }
        return false;
    }
    async setUserOnline(userId, isOnline) {
        try {
            const dbUser = await User.findOneBy({ id: userId });
            if (dbUser) {
                dbUser.isOnline = isOnline;
                await dbUser.save();
            }
        }
        catch (error) {
            console.error(`Error updating user online status:`, error);
        }
    }
    async setBlockedUsers(userId, blockedUserIds) {
        try {
            const user = await User.findOneBy({ id: userId });
            if (user) {
                if (Array.isArray(user.blocklist)) {
                    user.blocklist = [...user.blocklist, ...blockedUserIds];
                    await user.save();
                }
            }
        }
        catch (error) {
            console.error(`Error updating blocked users:`, error);
        }
    }
    async setUnblockedUsers(userId, unblockedUserIds) {
        try {
            const user = await User.findOneBy({ id: userId });
            if (user && Array.isArray(user.blocklist)) {
                user.blocklist = user.blocklist.filter(id => !unblockedUserIds.includes(id));
                await user.save();
            }
        }
        catch (error) {
            console.error(`Error updating unblocked users:`, error);
        }
    }
    createChatUser(user, socketId) {
        return {
            id: user.id.toString(),
            socketId: socketId,
            login: user.login,
            nickName: user.nickName,
            avatar: user.avatar || '',
            status: 'online',
            blocklist: user.blocklist || []
        };
    }
}
export const userService = new UserService();
//# sourceMappingURL=userService.js.map