const fp = require('fastify-plugin');
const authService = require('../services/auth.service');

module.exports = fp(async function (fastify, opts) {
  // Auxiliar function to determine token type.
  function getTokenType(token) {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      // Custom tokens of Firebase.
      if (decoded.uid) return 'firebase';
      if (decoded.uid && decoded.email) return 'jwt';
      return 'unknown';
    } catch (e) {
      console.error('Error al decodificar token:', e);
      return 'invalid';
    }
  }
  
  // The authenticate function must be defined inside in order to have access to fastify.
  async function authenticate(request, reply) {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('No token provided');
      }
      
      const tokenType = getTokenType(token);
      
      if (tokenType === 'jwt') {
        // Confirm with fastify-jwt (local token).
        const decodedJWT = fastify.jwt.verify(token);
        request.user = decodedJWT;
      } else if (tokenType === 'firebase') {
        // Verify with Firebase.
        const decodedFirebaseToken = await authService.verifyToken(token);
        request.user = decodedFirebaseToken;
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      reply.code(401).send({ error: 'Authentication failed', message: error.message });
    }
  }
  
  fastify.decorate('authenticate', authenticate);
  
  // Check if the ‘user’ decorator already exists before adding it. Need it to pass the user info between functions.
  if (!fastify.hasRequestDecorator('user')) {
    fastify.decorateRequest('user', null);
  }
});
