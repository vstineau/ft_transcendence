import type { FastifyInstance } from 'fastify';
import type { Socket } from 'socket.io';

export function setupChat(app: FastifyInstance) {
  const ns = (app as any).io.of('/chat');

  ns.on('connection', (socket: Socket) => {
    app.log.info({ id: socket.id }, 'Chat connected');
  });
}
