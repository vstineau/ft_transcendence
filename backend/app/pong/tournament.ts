import { Socket, Server } from 'socket.io';
import { JwtPayload } from '../types/userTypes.js';
import { User } from '../models.js';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance {
		io: Server;
	}
}

export async function startTournament(app: FastifyInstance) {
	app.ready().then(() => {
		app.io.of('/tournament').on('connection', (socket: Socket) => {
			socket.on('disconnect', () => {
				socket.removeAllListeners();
				socket.disconnect();
				socket.off;
				// console.log('A user disconnected from /tournament');
			});
			socket.on('getPlayerName', async (cookie: string) => {
				if (cookie) {
					const payload = app.jwt.verify<JwtPayload>(cookie);
					const user = await User.findOneBy({ id: payload.id });
					if (!user) {
						socket.emit('NameIs', '');
						return;
					}
					// console.log('name is = ' + user.nickName);
					socket.emit('NameIs', user.nickName);
					socket.removeAllListeners();
					socket.disconnect();
					socket.off;
				}
			});
		});
	});
}
