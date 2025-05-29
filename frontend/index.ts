
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {createReadStream, existsSync} from "fs"
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
	logger: true,
	trustProxy: true,
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true
});

await fastify.register(cors, {
  origin: 'http://backend:3000',
});

fastify.get('/src/*', async (request, reply) => {
  const filePath = path.join(__dirname, request.url);
  if (!filePath.startsWith(path.join(__dirname, 'src'))) {
    return reply.code(403).send('Forbidden');
  }
  if (!existsSync(filePath)) {
    return reply.code(404).send('Not found');
  }
  return reply.code(200).type("text/javascript").send(createReadStream(filePath));
});

fastify.get('/*', async (_request, reply) => {
	return reply.code(200).type("text/html").send(createReadStream(path.normalize(path.join(__dirname, "../public/index.html")))); 
})

fastify.listen({port: 5000, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Frontend listening at ${address}`)
})

//fetch('http://backend:3000/')
//  .then(response => response.text())
//  .then(data => {
//    console.log('backend :', data);
//  })
//  .catch(err => {
//    console.error('Erreur lors de la requête vers le backend :', err);
//  });
//
