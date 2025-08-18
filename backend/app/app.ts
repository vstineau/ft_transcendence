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

export const app = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});


// Enregistre les métriques par défaut (CPU, mémoire, etc.) (prometheus)
await app.register(import('./routes/monitoring.route.js'));


await app.register(cors, {
	origin: ['https://localhost:8080', 'http://localhost:8080'],
	methods: ['GET', 'POST'],
	credentials: true,
});

await app.register(fastifyCookie);

await app.register(socketioServer);

await app.register(fastifyOauth2, {
  name: 'githubOAuth2',
  scope: ['user:email'],
  credentials: {
    client: {
      id: '<GITHUB_CLIENT_ID>',
      secret: '<GITHUB_CLIENT_SECRET>',
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token'
    },
  },
  startRedirectPath: '/login/github',
  callbackUri: 'https://10.11.1.13:8080/api/login/github/callback'
});


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

