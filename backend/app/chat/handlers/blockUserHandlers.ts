// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { CHAT_EVENTS } from '../config/chatConfig.js';
import { User } from '../../models.js';


export async function handleBlockUser(socket: Socket, data: { targetUserId: string, currentUserId: string }, app: FastifyInstance) {

	const blocked = data.targetUserId;

	try {
		const user = await User.findOneBy({ id: data.currentUserId });
		if (user) {
			// checker si l'utilisateur target est déjà dans la blocklist
			if (user.blocklist && user.blocklist.includes(blocked)) {
				// l'utilisateur est déjà bloqué donc on le debloque
				user.blocklist = user.blocklist.filter(id => id !== blocked);
				await User.save(user);
				socket.emit(CHAT_EVENTS.USER_DEBLOCKED, { targetUserId: blocked });
				return;
			}
			else {
				// Ajouter l'utilisateur à la blocklist
				user.blocklist = user.blocklist ? [...user.blocklist, blocked] : [blocked];
				await User.save(user);
				socket.emit(CHAT_EVENTS.USER_BLOCKED, { targetUserId: blocked });
				return;
			}
		}
	} catch (error) {
		app.log.error('Error blocking user:', error);
		socket.emit(CHAT_EVENTS.ERROR, 'Error blocking user');
	}
}
