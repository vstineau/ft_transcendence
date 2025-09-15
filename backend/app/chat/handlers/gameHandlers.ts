// @ts-ignore
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

  // Trouver le socketId du destinataire
  const targetUser = userService.findUserById(data.targetUserId);

  // Envoyer l'invitation au destinataire
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

export function handleGameInvitationResponse(
  socket: Socket,
  data: { invitationId: string; accepted: boolean; targetSocketId: string }
): void {
  const user = userService.getUser(socket.id);
  const targetUser = userService.getUser(data.targetSocketId);
  if (!user || !targetUser) return;

  const url = `/pong/matchmaking/game?p1=${encodeURIComponent(user.id)}&p2=${encodeURIComponent(targetUser.id)}`;

  // Envoyer la réponse à l'inviteur (targetSocketId)
  socket.to(data.targetSocketId).emit(CHAT_EVENTS.GAME_INVITATION_ANSWER, {
    from: user,
    url: url,
    accepted: data.accepted,
    invitationId: data.invitationId
  });

  // Envoyer la réponse à l'invité (socket) seulement si acceptée
  if (data.accepted) {
    socket.emit(CHAT_EVENTS.GAME_INVITATION_ANSWER, {
      from: user,
      url: url,
      accepted: data.accepted,
      invitationId: data.invitationId
    });
  }
}

export function handleStatusChange(
  socket: Socket,
  data: { userId: string; status: 'online' | 'in-game' },
  chatNamespace: any
): void {
  const success = userService.updateUserStatus(socket.id, data.status);

  if (success) {
    const user = userService.getUser(socket.id);
    if (user) {
      // Notifier tous les utilisateurs du changement de statut
      chatNamespace.emit(CHAT_EVENTS.USER_STATUS_CHANGED, {
        userId: user.id,
        status: data.status
      });
    }
  }
}
