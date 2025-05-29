const fp = require('fastify-plugin');
const jwt = require('@fastify/jwt');
const cookie = require('@fastify/cookie');
const config = require('../config/config');

module.exports = fp(async function (fastify, opts) {
  // Register JWT plugin.
  fastify.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: '12h'
    }
  });

  // Register cookie plugin.
  fastify.register(cookie, {
    secret: config.cookie.secret,
    hook: 'onRequest',
    parseOptions: {}
  });

  // Decorate with JWT utility functions.
  fastify.decorate('generateToken', function(payload) {
    return this.jwt.sign(payload);
  });

  fastify.decorate('verifyToken', function(token) {
    try {
      return this.jwt.verify(token);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  });
});
