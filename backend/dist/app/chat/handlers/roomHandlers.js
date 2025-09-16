import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { roomService } from '../services/roomService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';
export async function handleJoinPrivateRoom(socket, data, app) {
    const user = userService.getUser(socket.id);
    if (!user)
        return;
    const roomName = roomService.generatePrivateRoomName(user.id, data.targetUserId);
    socket.join(roomName);
    const targetUser = userService.findUserById(data.targetUserId);
    if (targetUser && targetUser.socketId) {
        const targetSocket = socket.to(targetUser.socketId);
        targetSocket.socketsJoin(roomName);
        targetSocket.emit(CHAT_EVENTS.PRIVATE_ROOM_CREATED, {
            roomName,
            withUser: {
                id: user.id,
                username: user.nickName || user.login,
                avatar: user.avatar
            }
        });
    }
    try {
        const roomMessages = await messageService.getRoomMessages(roomName);
        socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: roomMessages });
    }
    catch (error) {
        app.log.error('Error fetching room messages:', error);
        socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: [] });
    }
}
//# sourceMappingURL=roomHandlers.js.map