import { User } from '../models.js';
import speakeasy from 'speakeasy';
import { encryptSecret } from '../utils/encryption.js';
import QRCode from 'qrcode';
export default {
    method: 'POST',
    url: '/enable2fa',
    handler: async (request, reply) => {
        try {
            console.log('=== activer 2fa BACKEND ===');
            console.log('request.body:', request.body);
            console.log('cookie header:', request.headers.cookie);
            const cookieHeader = request.headers.cookie;
            if (!cookieHeader) {
                throw new Error('No cookies found');
            }
            const tokenMatch = cookieHeader.match(/token=([^;]+)/);
            if (!tokenMatch) {
                throw new Error('Token not found in cookies');
            }
            const token = tokenMatch[1];
            const decoded = reply.server.jwt.verify(token);
            const user = await User.findOneBy({ id: decoded.id });
            if (!user) {
                throw new Error('User not found');
            }
            if (user.twoFaAuth) {
                throw new Error('2FA already enabled');
            }
            const secret = speakeasy.generateSecret({
                name: `transcendence ${user.login}`
            });
            user.twoFaSecret = encryptSecret(secret.base32);
            user.twoFaAuth = true;
            await user.save();
            let qrCodeDataURL = '';
            if (secret.otpauth_url) {
                qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
            }
            const response = {
                success: true,
                qrCode: qrCodeDataURL
            };
            reply.code(200).send(response);
        }
        catch (error) {
            console.log('ENABLE2FA ERROR:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to enable 2FA';
            const response = { success: false, error: errorMessage };
            reply.code(400).send(response);
        }
    }
};
//# sourceMappingURL=enable2fa.js.map