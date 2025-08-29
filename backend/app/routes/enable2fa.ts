
// import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply } from '../types/userTypes.js'
import speakeasy from 'speakeasy'
import { encryptSecret } from '../utils/encryption.js'
import QRCode from 'qrcode'

export default {
    method: 'POST',
    url: '/enable2fa',
    handler: async (request: any, reply: any) => {
        try {
            console.log('=== activer 2fa BACKEND ===');
            console.log('request.body:', request.body);
            console.log('cookie header:', request.headers.cookie);

            // Extraire le token depuis les headers directement
            const cookieHeader = request.headers.cookie;
            if (!cookieHeader) {
                throw new Error('No cookies found');
            }

            const tokenMatch = cookieHeader.match(/token=([^;]+)/);
            if (!tokenMatch) {
                throw new Error('Token not found in cookies');
            }

            const token = tokenMatch[1];
            const decoded = reply.server.jwt.verify(token) as any;
            const user = await User.findOneBy({ id: decoded.id });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.twoFaAuth) {
                throw new Error('2FA already enabled');
            }

            // Générer le secret 2FA
            const secret = speakeasy.generateSecret({
                name: `transcendence ${user.login}`
            });

            // Sauvegarder le secret (mais ne pas encore activer 2FA)
            user.twoFaSecret = encryptSecret(secret.base32);
            user.twoFaAuth = true;
            await user.save();

            // Générer le QR code
            let qrCodeDataURL = '';
            if (secret.otpauth_url) {
                qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
            }

            const response: IUserReply[200] = {
                success: true,
                qrCode: qrCodeDataURL
            };
            reply.code(200).send(response);

        } catch (error: any) {
            console.log('ENABLE2FA ERROR:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to enable 2FA';
            const response: IUserReply[400] = { success: false, error: errorMessage };
            reply.code(400).send(response);
        }
    }
}