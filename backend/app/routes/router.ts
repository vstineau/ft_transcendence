import register from './register.js'
import home from './root.js'
import login from './login.js'
import logout from './logout.js'
import deleteAccount from './deleteAccount.js'
import updateInfosGet from './updateInfosGet.js'
import updateInfosPost from './updateInfosPost.js'
import matchMaking from './matchMaking.js'
import oauth2 from './oauth2.js'
//import oauth2Redir from './oauth2Redir.js'
import { FastifyPluginCallback } from 'fastify';

export const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.route(register);
  fastify.route(home);
  fastify.route(login);
  fastify.route(logout);
  fastify.route(deleteAccount);
  fastify.route(updateInfosGet);
  fastify.route(updateInfosPost);
  fastify.route(matchMaking);
  fastify.route(oauth2);
 // fastify.route(oauth2Redir);
  done()
}
