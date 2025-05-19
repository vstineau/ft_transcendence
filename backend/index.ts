//https://github.com/matschik/fastify-typescript-starter
import Fastify from 'fastify'
//import rootController from './controller/root.controller'
import cors from '@fastify/cors'
import {FastifyRequest, FastifyReply} from 'fastify';
//import path from 'path'

const fastify = Fastify({
	logger: true,
	trustProxy: true,
});

await fastify.register(cors, {
  origin: 'http://frontend:5000',
});

//fastify.register(require('@fastify/static'), {
//  root: path.join(__dirname, 'public'),
//})


fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
	return reply.code(200).send("backend??????")
}),

//fastify.register(rootController, {prefix: '/'})

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
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
