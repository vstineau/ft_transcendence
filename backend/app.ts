import Fastify from 'fastify';
import cors from '@fastify/cors';
import {Server} from 'socket.io';
//import rootController from 'controller/root.controller'
//import path from 'path'

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const app = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();

await app.register(cors, {
  origin: 'http://frontend:5000',
});

//fastify.register(require('@fastify/static'), {
//  root: path.join(__dirname, 'public'),
//})

app.register(import('socket.fastify-socket.io'))
app.register(import('./routes/root.route.js'))
app.register(import('./db.js'))

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    //process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

//fetch('http://frontend:5000/')
//  .then(response => response.text())
//  .then(data => {
//    console.log('backend :', data);
//  })
//  .catch(err => {
//    console.error('Erreur lors de la requête vers le backend :', err);
//  });
//
