import type { Socket } from 'socket.io';
import { userService } from '../services/userService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';

export function handleGameInvitation(
  socket: Socket,
  data: { targetUserId: string; gameType: 'pong' | 'snake' },
  chatNamespace: any
): void {
  const user = userService.getUser(socket.id);
  if (!user) return;

  const targetUser = userService.findUserById(data.targetUserId);

  if (targetUser) {
    chatNamespace.to(targetUser.socketId).emit(CHAT_EVENTS.GAME_INVITATION_RECEIVED, {
      from: user,
      gameType: data.gameType,
      invitationId: Date.now().toString()
    });
  }
}

export function handleGameInvitationResponse(
  socket: Socket,
  data: { invitationId: string; accepted: boolean; targetSocketId: string }
): void {
  const user = userService.getUser(socket.id);
  if (!user) return;

  socket.to(data.targetSocketId).emit(CHAT_EVENTS.GAME_INVITATION_ANSWER, {
    from: user,
    accepted: data.accepted,
    invitationId: data.invitationId
  });
}

export function handleStatusChange(
  socket: Socket,
  status: 'online' | 'in-game',
  chatNamespace: any
): void {
  const success = userService.updateUserStatus(socket.id, status);
  
  if (success) {
    const user = userService.getUser(socket.id);
    if (user) {
      // Notifier tous les utilisateurs du changement de statut
      chatNamespace.emit(CHAT_EVENTS.USER_STATUS_CHANGED, {
        userId: user.id,
        status: status
      });
    }
  }
}
