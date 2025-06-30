
import { FastifyInstance } from 'fastify';
import { userController } from '../controller/user.controller.js';

//https://fastify.dev/docs/latest/Reference/Routes/


export default async function userRoute(fastify: FastifyInstance) {
  fastify.register(userController);
}
