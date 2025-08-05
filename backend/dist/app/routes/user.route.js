import { userController } from '../controller/user.controller.js';
export default async function userRoute(fastify) {
    fastify.register(userController);
}
//# sourceMappingURL=user.route.js.map