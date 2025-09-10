// @ts-ignore
import type { Socket } from 'socket.io';
import { User } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
// @ts-ignore
import { In } from 'typeorm';
import { userService } from '../services/userService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';

export async function handleAddFriend(
  socket: Socket,
  data: { targetUserId: string },
  app: any
): Promise<void> {
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

    // Vérifier blocklist
    if ((target.blocklist || []).includes(me.id)) {
      socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'User has blocked you');
      return;
    }

    // Vérifier s'il est déjà ami
    const myFriends = me.friends || [];
    if (myFriends.includes(target.id)) {
      socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Already in your friend list');
      return;
    }

    // Ajouter dans ma liste d'amis
    me.friends = [...myFriends, target.id];
    await repo.save(me);

    // Renvoyer l'utilisateur à ajouter coté client (shape simplifiée)
    const payload = {
      id: target.id,
      login: target.login,
      nickName: target.nickName,
      avatar: target.avatar || '',
      status: target.isOnline ? 'online' : 'offline'
    };

    socket.emit(CHAT_EVENTS.FRIEND_ADDED, payload);

    // Optionnel: synchroniser liste complète
    const friends = await buildFriendList(me.id);
    socket.emit(CHAT_EVENTS.FRIEND_LIST_UPDATED, friends);

  } catch (err) {
    app.log.error('handleAddFriend error', err);
    socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Failed to add friend');
  }
}

export async function buildFriendList(userId: string) {
  const repo = SqliteDataSource.getRepository(User);
  const me = await repo.findOne({ where: { id: userId } });
  const ids = me?.friends || [];
  if (ids.length === 0) return [];
  const users = await repo.find({ where: { id: In(ids as any) } });
  return users.map((u: User) => ({
    id: u.id,
    username: u.nickName || u.login,
    avatar: u.avatar || '',
    status: u.isOnline ? 'online' : 'offline'
  }));
}

export async function handleDeleteFriend(
  socket: Socket,
  data: { targetUserId: string, currentUserId: string },
  app: any
): Promise<void> {
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
    me.friends = myFriends.filter((id: string) => id !== data.targetUserId);
    await repo.save(me);

    // Renvoyer la nouvelle liste d'amis
    const friends = await buildFriendList(me.id);
    socket.emit(CHAT_EVENTS.FRIEND_LIST_UPDATED, friends);

  } catch (err) {
    app.log.error('handleDeleteFriend error', err);
    socket.emit(CHAT_EVENTS.FRIEND_ERROR, 'Failed to delete friend');
  }
}

