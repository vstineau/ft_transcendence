//https://github.com/matschik/fastify-typescript-starter
import Fastify from 'fastify'
import cors from '@fastify/cors'

const server = Fastify()

await server.register(cors, {
  origin: 'http://localhost:3000',
});

//interface IQuerystring {
//  username: string;
//  password: string;
//}
//
//interface IHeaders {
//  'h-Custom': string;
//}
//
//interface IReply {
//  200: { success: boolean };
//  302: { url: string };
//  '4xx': { error: string };
//}
//
server.get('/*', async (_request, _reply) => {
  return 'pong\n'
})

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})


