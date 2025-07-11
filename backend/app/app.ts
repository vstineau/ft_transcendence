import Fastify from 'fastify';
import cors from '@fastify/cors';
import { SqliteDataSource } from './dataSource.js'
import { authJwt } from './auth/auth.js'
import config from './config.js'
import socketioServer from './plugins/socketIo.js'
import {startPongGame} from './pong/pong.js'

export const app = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

await app.register(cors, {
	origin: ['https://localhost:8080'],
	credentials: true,
});

await app.register(socketioServer);
authJwt(app, {jwtSecret: config.jwt.secret});
await app.register(import('./routes/root.route.js'));
await app.register(import('./routes/user.route.js'));
app.listen({port: 3000, host: '0.0.0.0'});

startPongGame(app);

await SqliteDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    })
