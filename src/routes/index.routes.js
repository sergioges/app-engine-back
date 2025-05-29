async function routes(fastify, options) {
  // Public route.
  fastify.get('/', async (request, reply) => {
    return { message: 'Bienvenido a la API de autenticación con Firebase' };
  });

  // Protected route.
  fastify.get('/protected', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    return { 
      message: 'Esta es una ruta protegida', 
      user: request.user 
    };
  });
}

module.exports = routes;
