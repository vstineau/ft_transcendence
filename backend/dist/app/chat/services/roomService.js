class RoomService {
    generatePrivateRoomName(userId1, userId2) {
        return `private_${[userId1, userId2].sort().join('_')}`;
    }
    isPrivateRoom(roomName) {
        return roomName.startsWith('private_');
    }
    isGlobalRoom(roomName) {
        return roomName === 'global';
    }
    isPongRoom(roomName) {
        return roomName === 'pong';
    }
    isSnakeRoom(roomName) {
        return roomName === 'snake';
    }
    extractUserIdsFromPrivateRoom(roomName) {
        if (!this.isPrivateRoom(roomName)) {
            return null;
        }
        const match = roomName.match(/^private_(.+)_(.+)$/);
        return match ? [match[1], match[2]] : null;
    }
    validateRoomAccess(userId, roomName) {
        if (this.isGlobalRoom(roomName) || this.isPongRoom(roomName) || this.isSnakeRoom(roomName)) {
            return true;
        }
        if (this.isPrivateRoom(roomName)) {
            const userIds = this.extractUserIdsFromPrivateRoom(roomName);
            return userIds ? userIds.includes(userId) : false;
        }
        return false;
    }
    getRoomDisplayName(roomName) {
        if (this.isGlobalRoom(roomName)) {
            return 'Global Chat';
        }
        if (this.isPrivateRoom(roomName)) {
            return 'Private Chat';
        }
        return roomName;
    }
}
export const roomService = new RoomService();
//# sourceMappingURL=roomService.js.map