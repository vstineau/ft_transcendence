
import { FastifyInstance } from 'fastify';
import { oauth2Controller } from '../controller/oauth2.controller.js';

//https://fastify.dev/docs/latest/Reference/Routes/


export default async function userRoute(fastify: FastifyInstance) {
  fastify.register(oauth2Controller);
}
