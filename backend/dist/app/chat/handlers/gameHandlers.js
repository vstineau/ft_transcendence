import { userService } from '../services/userService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';
export function handleGameInvitation(socket, data, chatNamespace) {
    const user = userService.getUser(socket.id);
    if (!user)
        return;
    const targetUser = userService.findUserById(data.targetUserId);
    if (targetUser) {
        chatNamespace.to(targetUser.socketId).emit(CHAT_EVENTS.GAME_INVITATION_RECEIVED, {
            from: {
                id: user.id,
                login: user.login,
                nickName: user.nickName,
                avatar: user.avatar,
                socketId: user.socketId
            },
            gameType: data.gameType,
            invitationId: Date.now().toString()
        });
    }
}
export function handleGameInvitationResponse(socket, data) {
    const user = userService.getUser(socket.id);
    const targetUser = userService.getUser(data.targetSocketId);
    if (!user || !targetUser)
        return;
    const url = `/pong/matchmaking/game?p1=${encodeURIComponent(user.id)}&p2=${encodeURIComponent(targetUser.id)}`;
    socket.to(data.targetSocketId).emit(CHAT_EVENTS.GAME_INVITATION_ANSWER, {
        from: user,
        url: url,
        accepted: data.accepted,
        invitationId: data.invitationId
    });
    if (data.accepted) {
        socket.emit(CHAT_EVENTS.GAME_INVITATION_ANSWER, {
            from: user,
            url: url,
            accepted: data.accepted,
            invitationId: data.invitationId
        });
    }
}
export function handleStatusChange(socket, data, chatNamespace) {
    const success = userService.updateUserStatus(socket.id, data.status);
    if (success) {
        const user = userService.getUser(socket.id);
        if (user) {
            chatNamespace.emit(CHAT_EVENTS.USER_STATUS_CHANGED, {
                userId: user.id,
                status: data.status
            });
        }
    }
}
//# sourceMappingURL=gameHandlers.js.map