// Fichier temporaire: routes/fix-password.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { hashPassword } from '../utils/hashPassword.js'

export default {
    method: 'POST',
    url: '/fixpassword',
    handler: async (request: FastifyRequest<{ Body: { login: string, password: string } }>, reply: FastifyReply) => {
        try {
            const { login, password } = request.body;
            const user = await User.findOneBy({ login });

            if (!user) {
                throw new Error('User not found');
            }

            // Hacher le mot de passe et le sauvegarder
            user.password = await hashPassword(password);
            await user.save();

            reply.send({ success: true, message: 'Password fixed' });
        } catch (error: any) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
}
