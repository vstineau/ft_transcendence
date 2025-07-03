import Fastify from 'fastify';
import cors from '@fastify/cors';
import { SqliteDataSource } from './dataSource.js'
import { authJwt } from './auth/auth.js'
import config from './config.js'

export const app = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

// const io = new Server<
//   ClientToServerEvents,
//   ServerToClientEvents,
//   InterServerEvents,
//   SocketData
// >();

await app.register(cors, {
	origin: ['https://localhost:8080', 'http://localhost:8080'],
	credentials: true,
});

//fastify.register(require('@fastify/static'), {
//  root: path.join(__dirname, 'public'),
//})

// app.register(import('socket.fastify-socket.io'))
app.register(import('./routes/root.route.js'));
app.register(import('./routes/user.route.js'));
app.listen({port: 3000, host: '0.0.0.0'});
app.register(authJwt, {jwtSecret: config.jwt.secret});

await SqliteDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    })
