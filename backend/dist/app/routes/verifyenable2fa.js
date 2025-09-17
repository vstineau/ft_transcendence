import { User } from '../models.js';
import { decryptSecret } from '../utils/encryption.js';
import speakeasy from 'speakeasy';
export default {
    method: 'POST',
    url: '/verifyenable2fa',
    handler: async (request, reply) => {
        try {
            console.log('=== Verify enable2fa ===');
            console.log('request.body:', request.body);
            const { token } = request.body;
            if (!request.cookies.token) {
                throw new Error('Authentication token missing');
            }
            const decoded = reply.server.jwt.verify(request.cookies.token);
            const user = await User.findOneBy({ id: decoded.id });
            if (!user || !user.twoFaSecret) {
                throw new Error('2FA setup not initiated');
            }
            const secret = decryptSecret(user.twoFaSecret);
            const isValid = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 1,
            });
            if (!isValid) {
                throw new Error('Invalid 2FA code');
            }
            user.twoFaAuth = true;
            await user.save();
            reply.code(200).send({ success: true });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Verification failed';
            reply.code(400).send({ success: false, error: errorMessage });
        }
    }
};
//# sourceMappingURL=verifyenable2fa.js.map