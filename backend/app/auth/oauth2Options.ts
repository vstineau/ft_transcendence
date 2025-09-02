
const clientId = process.env.GITHUB_CLIENT_ID ?? '';
const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? '';

export default {
  name: 'githubOAuth2',
  scope: ['user:email'],
  credentials: {
    client: {
      id: clientId,
      secret: clientSecret, 
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token'
    },
  },
  startRedirectPath: '/login/github',
  callbackUri: `https://${process.env.POSTE}:8080/api/login/github/callback`
}
