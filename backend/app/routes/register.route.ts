
import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { rootController } from '../controller/root.controller.js';

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


export default async function rootRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/register',
	//preValidation: fastify.auth([verifyJWT, verifyPermissions]),
    handler: rootController,
    ...registerControllerOptions
  });
}
