
import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { userController } from '../controller/user.controller.js';

//https://fastify.dev/docs/latest/Reference/Routes/

const registerControllerOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
};


export default async function userRoute(fastify: FastifyInstance) {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/user/',
	//preValidation: fastify.auth([verifyJWT, verifyPermissions]),
    handler: userController,
    ...registerControllerOptions
  });
}
