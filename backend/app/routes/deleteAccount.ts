import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, JwtPayload } from '../types/userTypes.js'

export default {
	method: 'POST',
	url: '/deleteAccount',
	handler: async (
		request: FastifyRequest,
		reply: FastifyReply
	): Promise<void> => {
		try {
			const token = request.cookies?.token;
			const { email, password } = request.body as { email: string; password: string };

			if (!token) {
				const response: IUserReply[401] = { success: false, error: 'No authentication token' };
				reply.code(401).send(response);
				return;
			}

			if (!email || !password) {
				const response: IUserReply[401] = { success: false, error: 'Email and password are required' };
				reply.code(401).send(response);
				return;
			}

			const payload = reply.server.jwt.verify<JwtPayload>(token);
			const user = await User.findOneBy({ login: payload.login });

			if (!user || user.email !== email) {
				const response: IUserReply[401] = { success: false, error: 'Invalid credentials' };
				reply.code(401).send(response);
				return;
			}

			// Supprimer l'utilisateur
			await user.remove();

			const response: IUserReply[200] = { success: true };
			reply
				.clearCookie('token', {
					httpOnly: true,
					secure: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 4 * 60 * 60
				})
				.code(200)
				.send(response);

		} catch (error: any) {
			const response: IUserReply[401] = { success: false, error: 'invalid JWT' };
			reply.code(401).send(response);
		}
	}
};

// export default {
//   method: 'POST',
//   url: '/deleteAccount',
//   handler: async (
//     request: FastifyRequest,
//     reply: FastifyReply
//   ): Promise<void> => {
//     try {
//       const token = request.cookies?.token
//       if (token) {
//         const payload = reply.server.jwt.verify<JwtPayload>(token)
//         const user = await User.findOneBy({ login: payload.login })
//         if (user) {
//           await user.remove()
// 	      const response : IUserReply[200] = {success: true};
//           reply
//             .clearCookie('token', {
//               httpOnly: true,
//               secure: true,
//               path: '/',
//               sameSite: 'lax',
//               maxAge: 4 * 60 * 60
//             })
//             .code(200)
//             .send(response);
//           return
//         }
//       }
//       // If no user or no token, consider as unauthorized
// 	  const response : IUserReply[401] = {success: false, error: 'invalid JWT'};
//       reply.code(401).send(response);
//     } catch (error: any) {
// 	  const response : IUserReply[401] = {success: false, error: 'invalid JWT'};
//       reply.code(401).send(response);
//     }
//   }
// }
