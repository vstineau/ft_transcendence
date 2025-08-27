import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { ValidationError } from 'class-validator'
import { QueryFailedError } from 'typeorm'
import { IUserReply, UserJson, JwtPayload, defaultAvatars, mimeTypes } from '../types/userTypes.js'
import { extname } from 'path'
import { readFile } from 'fs/promises'
import speakeasy from 'speakeasy';
import { encryptSecret} from '../utils/encryption.js'
import QRCode from 'qrcode';

export default {
  method: 'POST',
  url: '/updateInfos',
  handler: async (
    request: FastifyRequest<{ Body: UserJson }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const token = request.cookies?.token
      if (token) {
        const payload = reply.server.jwt.verify<JwtPayload>(token)
        const user = await User.findOneBy({ login: payload.login })
        if (user) {
		  let qrCodeDataURL: string = '';
          // Mise à jour des infos si présent dans le body
          if (request.body.login) user.login = request.body.login
          if (request.body.nickName) user.nickName = request.body.nickName
          if (request.body.email) user.email = request.body.email
		  if (!user.twoFaAuth && request.body.twoFaAuth) {
			const secret = speakeasy.generateSecret({name: `transcendence ${user.login}`});
			user.twoFaSecret = encryptSecret(secret.base32);
			if (secret.otpauth_url) {
				qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
			}
		  }
		  else if (user.twoFaAuth && request.body.twoFaAuth === false) {
			user.twoFaAuth = false;
			user.twoFaSecret = '';
		  }
          if (
            request.body.password &&
            request.body.newPassword &&
            await user.comparePassword(request.body.password)
          ) {
            user.password = request.body.newPassword
          }
          if (request.body.avatar) {
            const buffer = request.body.avatar
            const ext = request.body.ext
            if (ext) {
              const mime = mimeTypes[ext] || 'application/octet-stream'
              user.avatar = `data:${mime};base64,${buffer.toString()}`
            }
          } else if (request.body.noAvatar) {
            const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
            const buffer = await readFile(file)
            const ext = extname(file).toLowerCase()
            const mime = mimeTypes[ext] || 'application/octet-stream'
            user.avatar = `data:${mime};base64,${buffer.toString('base64')}`
          }
          await user.save()
          const token = reply.server.jwt.sign(await user.getInfos(), { expiresIn: '4h' })
	        const response : IUserReply[200] = {success: true, qrCode: qrCodeDataURL};
          reply
            .setCookie('token', token, {
              httpOnly: false,
              secure: true,
              path: '/',
              sameSite: 'lax',
              maxAge: 4 * 60 * 60
            })
            .code(200)
            .send(response);
          return
        }
      }
	  const response : IUserReply[401] = {success: false, error: 'invalid JWT'};
      reply.code(401).send(response);
    } catch (error: any) {
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
          String(error.driverError?.message).includes('UNIQUE constraint failed: user.email')
        ) {
          errorMessage = 'this email is already used'
        } else if (
          String(error.driverError?.message).includes('UNIQUE constraint failed: user.login')
        ) {
          errorMessage = 'this login is already used'
        }
      }
	  const response : IUserReply[401] = {success: false, error: errorMessage};
      reply.code(400).send(response);
    }
  }
}
