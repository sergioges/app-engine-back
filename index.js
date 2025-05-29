const fastify = require('fastify')({ logger: true });
const path = require('path');
require('dotenv').config();

const config = require('./src/config/config');

// Registrar plugins en orden específico
fastify.register(require('./src/plugins/auth')); // Primero registramos el plugin JWT y cookie
fastify.register(require('./src/plugins/authenticate')); // Luego el plugin de autenticación que depende del anterior

// Registrar plugin para servir archivos estáticos
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Registrar rutas
fastify.register(require('./src/routes/auth.routes'), { prefix: '/api/auth' });
fastify.register(require('./src/routes/index.routes'), { prefix: '/api' });
fastify.register(require('./src/routes/reservations.routes'), { prefix: '/api/reservations' });

// Configurar manejo de errores global
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Firebase Auth errors tienen un código específico
  if (error.code && error.code.startsWith('auth/')) {
    return reply.code(400).send({ 
      error: 'Authentication Error',
      message: error.message,
      code: error.code
    });
  }
  
  // Error genérico
  reply.code(error.statusCode || 500).send({ 
    error: error.name || 'Internal Server Error',
    message: error.message || 'An internal server error occurred'
  });
});

// Iniciar el servidor
const start = async () => {
  try {
    await fastify.listen({ port: config.server.port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();