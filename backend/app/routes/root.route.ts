import { FastifyInstance } from 'fastify';
import { rootController } from '../controller/root.controller.js';

//https://fastify.dev/docs/latest/Reference/Routes/

export default async function userRoute(fastify: FastifyInstance) {
  fastify.register(rootController);
}

//const rootControllerOptions: RouteShorthandOptions = {
//  schema: {
//    response: {
//      200: {
//        type: 'object',
//        properties: {
//          message: { type: 'string' }
//        }
//      }
//    }
//  }
//};
//
//
//export default async function rootRoutes(fastify: FastifyInstance) {
//  fastify.route({
//    method: ['GET', 'POST'],
//    url: '/',
//	//preValidation: fastify.auth([verifyJWT, verifyPermissions]),
//    handler: rootController,
//    ...rootControllerOptions
//  });
//}
