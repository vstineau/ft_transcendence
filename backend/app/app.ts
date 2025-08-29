import Fastify from 'fastify';
import cors from '@fastify/cors';
import { SqliteDataSource } from './dataSource.js'
import { authJwt } from './auth/auth.js'
import config from './config.js'
import socketioServer from './plugins/socketIo.js'
import {startPongGame} from './pong/pong.js'
import {startSnakeGame} from './snake/snake.js'
import fastifyCookie from '@fastify/cookie';
import fastifyOauth2 from '@fastify/oauth2';
import {userRoutes} from './routes/router.js'
import oauth2Options from './auth/oauth2Options.js'

export const app = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

app.addHook('onRequest', async (request, _reply) => {
    console.log(`${request.method} ${request.url}`);
    if (request.url === '/api/enable2fa' || request.url === '/enable2fa') {
        console.log('=== ENABLE2FA REQUEST DETECTED ===');
        console.log('Headers:', request.headers);
        console.log('Cookies:', request.cookies);
    }
});

// Enregistre les métriques par défaut (CPU, mémoire, etc.) (prometheus)
await app.register(import('./routes/monitoring.route.js'));


await app.register(cors, {
	origin: [`https://${process.env.IP}:8080`,
		`https://localhost:8080`,
		`https://${process.env.POSTE}:8080`],
	methods: ['GET', 'POST'],
	credentials: true,
});

await app.register(fastifyCookie);

await app.register(socketioServer);

await app.register(fastifyOauth2, oauth2Options);


await startPongGame(app);
await startSnakeGame(app);
authJwt(app, {jwtSecret: config.jwt.secret});
await app.register(userRoutes);


await SqliteDataSource.initialize()
.then(() => {
	console.log("Data Source has been initialized!");
})
.catch((err) => {
	console.error("Error during Data Source initialization", err);
})

app.listen({port: 3000, host: '0.0.0.0'});

