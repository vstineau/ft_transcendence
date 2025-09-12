import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../models.js';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import { IUserReply, UserJson, defaultAvatars, mimeTypes } from '../types/userTypes.js';
import { extname } from 'path';
import { readFile } from 'fs/promises';
import speakeasy from 'speakeasy';
import { encryptSecret} from '../utils/encryption.js';
import QRCode from 'qrcode';
import { hashPassword } from '../utils/hashPassword.js'

//Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:

export default {
  method: 'POST',
  url: '/register',
  handler: async (
    request: FastifyRequest<{ Body: UserJson }>,
    reply: FastifyReply
  ): Promise<void> => {
      try {
            // Validation du mot de passe
            if (request.body.password) {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!regex.test(request.body.password)) {
                    throw new Error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character');
                }
                request.body.password = await hashPassword(request.body.password);
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (request.body.email && !emailRegex.test(request.body.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validation du login (pas de chiffres)
            if (request.body.login) {
                const loginRegex = /^[a-zA-Z]+$/;
                if (!loginRegex.test(request.body.login)) {
                    throw new Error('Login must contain only letters (no numbers or special characters)');
                }
            }

            // Validation du prénom/nom (pas de chiffres)
            if (request.body.nickName) {
                const nameRegex = /^[a-zA-Z\s'-]+$/;
                if (!nameRegex.test(request.body.nickName)) {
                    throw new Error('First name must contain only letters');
                }
            }

            const user = await User.createUser(request.body);


	  let qrCodeDataURL: string = '';
	  if (user.twoFaAuth) {
			const secret = speakeasy.generateSecret({name: `transcendence ${user.login}`});
			user.twoFaSecret = encryptSecret(secret.base32);
			if (secret.otpauth_url) {
				qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
			} else {
        user.twoFaSecret = undefined;
      }
	  }
	  if (request.body.avatar) {
        user.avatar = request.body.avatar
      } else {
        const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        const buffer = await readFile(file)
        const ext = extname(file).toLowerCase()
        const mime = mimeTypes[ext] || 'application/octet-stream'
        user.avatar = `data:${mime};base64,${buffer.toString('base64')}`
      }
      await user.save()

	  const response : IUserReply[200] = {success: true, qrCode: qrCodeDataURL};
      reply.code(200).send(response);
    }  catch (error) {
            console.log(error);
            let errorMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (Array.isArray(error)) {
                error.forEach((err) => {
                    if (err instanceof ValidationError) {
                        if (err.constraints?.matches) {
                            errorMessage = 'Password format is invalid';
                        } else if (err.constraints?.isEmail) {
                            errorMessage = 'Email format is invalid';
                        } else if (err.constraints?.isLength) {
                            if (err.property === 'login') {
                                errorMessage = 'Login must be between 3 and 20 characters';
                            } else if (err.property === 'password') {
                                errorMessage = 'Password must be at least 8 characters long';
                            } else {
                                errorMessage = 'Field length is invalid';
                            }
                        } else {
                            errorMessage = 'Validation error occurred';
                        }
                    }
                });
            } else if (
                error instanceof QueryFailedError &&
                error.driverError?.code === 'SQLITE_CONSTRAINT'
            ) {
                if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.email')) {
                    errorMessage = 'This email address is already registered';
                } else if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.login')) {
                    errorMessage = 'This username is already taken';
                }
            }

            const response: IUserReply[400] = { success: false, error: errorMessage };
            reply.code(400).send(response);
        }
    }
}
