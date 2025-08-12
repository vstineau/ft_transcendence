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

export default {
  method: 'POST',
  url: '/register',
  // Typage du body et de la reply ici :
  handler: async (
    request: FastifyRequest<{ Body: UserJson }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const user = await User.createUser(request.body)
	  let qrCodeDataURL: string;
	  if (user.twoFaAuth) {
			const secret = speakeasy.generateSecret({name: `transcendence ${user.login}`});
			user.twoFaSecret = encryptSecret(secret);
			qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
	  } else {
			qrCodeDataURL = '';
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
    } catch (error) {
      let errorMessage = 'unknown error'
      if (Array.isArray(error)) {
        error.forEach((err) => {
          if (err instanceof ValidationError) {
            if (err.constraints?.matches) {
              errorMessage = err.constraints.matches
            } else if (err.constraints?.isEmail) {
              errorMessage = err.constraints.isEmail
            } else if (err.constraints?.isLength) {
              errorMessage = err.constraints.isLength
            } else {
              errorMessage = 'Validation error'
            }
          }
        })
      } else if (
        error instanceof QueryFailedError &&
        error.driverError?.code === 'SQLITE_CONSTRAINT'
      ) {
        if (
          String(error.driverError?.message).includes(
            'UNIQUE constraint failed: user.email'
          )
        ) {
          errorMessage = 'this email is already used'
        } else if (
          String(error.driverError?.message).includes(
            'UNIQUE constraint failed: user.login'
          )
        ) {
          errorMessage = 'this login is already used'
        }
      }
	  const response : IUserReply[400] = {success: false, error: errorMessage };
      reply.code(400).send(response);
    }
  }
}
