import { User } from '../models.js';
import { hashPassword } from '../utils/hashPassword.js';
export default {
    method: 'POST',
    url: '/fixpassword',
    handler: async (request, reply) => {
        try {
            const { login, password } = request.body;
            const user = await User.findOneBy({ login });
            if (!user) {
                throw new Error('User not found');
            }
            user.password = await hashPassword(password);
            await user.save();
            reply.send({ success: true, message: 'Password fixed' });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
};
//# sourceMappingURL=fixpassword.js.map