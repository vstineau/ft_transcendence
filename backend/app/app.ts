import Fastify from 'fastify';
import cors from '@fastify/cors';
import { SqliteDataSource } from './dataSource.js'
import {User} from './models.js'

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
  origin: 'http://frontend:5000',
});

//fastify.register(require('@fastify/static'), {
//  root: path.join(__dirname, 'public'),
//})

// app.register(import('socket.fastify-socket.io'))
app.register(import('./routes/root.route.js'))
app.register(import('./routes/user.route.js'))

await SqliteDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
const userTest = await User.createUser({firstName: 'aa', lastName: 'bb', email: 'aa@aa.com',nickName: 'ouioui', password: 'aaabbb123**'});
await userTest.save();
//app.register(import('./db.js'))
