//import fp from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt'
//import config from '../config.js'


export async function authJwt(fastify: FastifyInstance, opts: any) {
  // Enregistrement du support JWT
  fastify.register(fastifyJwt, {
    secret: opts.jwtSecret  || 'secret_par_defaut' //jamais en prod
  })
	// console.log("jwt registered");

  // Décorateur d'authentification
  fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
	  let	errMessage: string = "unknown auth error";
	  if (err instanceof Error) {
				errMessage = err.message;
	  }
      reply.code(401).send({ error: 'Unauthorized', details: errMessage })
    }
  })
}

