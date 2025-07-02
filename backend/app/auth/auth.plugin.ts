import fp from 'fastify-plugin'
import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt'
import config from '../config.js'

export const authJwt: FastifyPluginCallback = (server, _opts, done) => {
module.exports = fp(async function(fastify, _opts) {
  server.register(fastifyJwt, {secret: config.jwt.secret}), {
    secret: "supersecret"
  })

  server.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
	}
	});
	done();
}
