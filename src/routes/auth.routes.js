const authService = require('../services/auth.service');

async function routes(fastify, options) {
  /**
   * Verify aunthentication status.
   */
  fastify.get('/status', async (request, reply) => {
    try {
      // Try to verify token from cookie or header. 
      const sessionCookie = request.cookies.session;
      const authHeader = request.headers.authorization?.replace('Bearer ', '');
      const token = authHeader || sessionCookie;
      
      if (!token) {
        return reply.code(401).send({ authenticated: false });
      }
      
      try {
        // Try to verify from JWT token.
        const decodedJWT = fastify.verifyToken(token);
        return reply.send({ 
          authenticated: true, 
          method: 'jwt',
          user: { uid: decodedJWT.uid, email: decodedJWT.email } 
        });
      } catch (jwtError) {
        try {
          // Try to verify from Firebase token.
          const decodedFirebaseToken = await authService.verifyToken(token);
          return reply.send({ 
            authenticated: true, 
            method: 'firebase',
            user: { 
              uid: decodedFirebaseToken.uid, 
              email: decodedFirebaseToken.email 
            } 
          });
        } catch (firebaseError) {
          return reply.code(401).send({ authenticated: false });
        }
      }
    } catch (error) {
      return reply.code(401).send({ authenticated: false });
    }
  });
  
  /**
   * Register new user.
   */
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            uid: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body;
      const userRecord = await authService.createUser(email, password);
      
      reply.code(201).send({
        uid: userRecord.uid,
        email: userRecord.email
      });
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Login user.
   */
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body;
      const { user, token } = await authService.signInWithEmailAndPassword(email, password);
      
      const jwtToken = fastify.generateToken({ uid: user.uid, email: user.email });
      
      // Set session cookie.
      reply.setCookie('session', jwtToken, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60
      });
      
      reply.send({
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        },
        token: jwtToken,
        firebaseToken: token
      });
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  /**
   * Close session.
   */
  fastify.post('/logout', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    // Clear session cookie.
    reply.clearCookie('session', { path: '/' });
    reply.send({ success: true, message: 'Logged out successfully' });
  });

  /**
   * Get user information.
   */
  fastify.get('/me', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const userRecord = await authService.getUserByUid(request.user.uid);
      
      reply.send({
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      });
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Update user information.
   */
  fastify.put('/me', {
    preHandler: fastify.authenticate,
    schema: {
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },
          photoURL: { type: 'string', format: 'uri' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const updatedUser = await authService.updateUser(request.user.uid, request.body);
      
      reply.send({
        uid: updatedUser.uid,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL
      });
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
