class RoomService {
  
  generatePrivateRoomName(userId1: string, userId2: string): string {
    return `private_${[userId1, userId2].sort().join('_')}`;
  }

  isPrivateRoom(roomName: string): boolean {
    return roomName.startsWith('private_');
  }

  isGlobalRoom(roomName: string): boolean {
    return roomName === 'global';
  }

  isPongRoom(roomName: string): boolean {
    return roomName === 'pong';
  }

  isSnakeRoom(roomName: string): boolean {
    return roomName === 'snake';
  }

  extractUserIdsFromPrivateRoom(roomName: string): string[] | null {
    if (!this.isPrivateRoom(roomName)) {
      return null;
    }
    
    const match = roomName.match(/^private_(.+)_(.+)$/);
    return match ? [match[1], match[2]] : null;
  }

  validateRoomAccess(userId: string, roomName: string): boolean {
    // Global room accessible à tous
    if (this.isGlobalRoom(roomName) || this.isPongRoom(roomName) || this.isSnakeRoom(roomName)) {
      return true;
    }

    // Room privée accessible seulement aux participants
    if (this.isPrivateRoom(roomName)) {
      const userIds = this.extractUserIdsFromPrivateRoom(roomName);
      return userIds ? userIds.includes(userId) : false;
    }

    // Autres types de rooms (future expansion)
    return false;
  }

  getRoomDisplayName(roomName: string): string {
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
