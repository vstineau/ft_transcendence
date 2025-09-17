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
import { startChat } from './chat/chat.js';
import {userRoutes} from './routes/router.js'
import oauth2Options from './auth/oauth2Options.js'
import { startTournament } from './pong/tournament.js';

export const app = Fastify({
	logger: false,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

// Enregistre les métriques /health et /metrics (Prometheus)
await app.register((await import('./routes/monitoring.route.js')).default);


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


await SqliteDataSource.initialize()
.then(() => {
	console.log("Data Source has been initialized!");
})
.catch((err) => {
	console.warn("Error during Data Source initialization", err);
})
try { await SqliteDataSource.runMigrations(); } catch (err) {console.log(err);}


await startPongGame(app);
await startSnakeGame(app);
await startChat(app);
await startTournament(app);

authJwt(app, {jwtSecret: config.jwt.secret});
await app.register(userRoutes);

app.listen({port: 3000, host: '0.0.0.0'});

