import fp from 'fastify-plugin';
import { Server } from 'socket.io';
const fastifySocketIO = fp(async function (fastify, opts) {
    function defaultPreClose(done) {
        fastify.io.local.disconnectSockets(true);
        done();
    }
    const { preClose, ...socketIoOpts } = opts;
    fastify.decorate('io', new Server(fastify.server, {
        path: '/socket.io',
        cors: {
            origin: ['https://localhost:8080'],
            methods: ['GET', 'POST'],
            credentials: true
        },
        ...socketIoOpts
    }));
    fastify.addHook('preClose', (done) => {
        if (preClose) {
            return preClose(done);
        }
        return defaultPreClose(done);
    });
    fastify.addHook('onClose', (fastify, done) => {
        fastify.io.close();
        done();
    });
}, { fastify: '>=4.0.0', name: 'fastify-socket.io' });
export default fastifySocketIO;
//# sourceMappingURL=socketIo.js.map