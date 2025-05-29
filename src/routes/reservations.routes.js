// Rutas para el manejo de reservas
const reservationsService = require('../services/reservations.service');

async function routes(fastify, options) {
  // Middleware que se aplicará a todas las rutas
  const reservationsAuth = {
    preHandler: fastify.authenticate
  };

  /**
   * Obtener todas las reservas
   * Solo accesible para usuarios autenticados
   */
  fastify.get('/', reservationsAuth, async (request, reply) => {
    try {
      const reservations = await reservationsService.getAllReservations();
      return { reservations };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Obtener reservas del usuario actual
   */
  fastify.get('/my', reservationsAuth, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const reservations = await reservationsService.getUserReservations(userId);
      return { reservations };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Crear una nueva reserva
   */
  fastify.post('/', {
    ...reservationsAuth,
    schema: {
      body: {
        type: 'object',
        required: ['dates', 'name', 'email', 'phone'],
        properties: {
          id: { type: 'string' }, // Permitir ID opcional
          dates: { 
            type: 'array',
            items: { type: 'string', format: 'date-time' },
            minItems: 1
          },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          hosts: { type: 'integer', minimum: 1 },
          pets: { type: 'string', enum: ['Sí', 'No'] },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' },
          totalNights: { type: 'integer', minimum: 1 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.uid;
      const reservationData = {
        ...request.body,
        userId
      };
      
      // Si no se proporciona status, establecemos pending por defecto
      if (!reservationData.status) {
        reservationData.status = 'pending';
      }
      
      // Si se proporciona el email del usuario actual, lo usamos
      if (!reservationData.email && request.user.email) {
        reservationData.email = request.user.email;
      }
      
      const newReservation = await reservationsService.createReservation(reservationData);
      
      reply.code(201).send(newReservation);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Actualizar una reserva
   */
  fastify.put('/:id', {
    ...reservationsAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          dates: { 
            type: 'array',
            items: { type: 'string', format: 'date-time' },
            minItems: 1
          },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          hosts: { type: 'integer', minimum: 1 },
          pets: { type: 'string', enum: ['Sí', 'No'] },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
          totalNights: { type: 'integer', minimum: 1 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const reservationData = request.body;
      
      // Validar permisos: el usuario puede actualizar solo sus propias reservas a menos que sea admin
      if (!request.user.admin) {
        const reservation = await reservationsService.getReservationById(id);
        if (!reservation || 
            (reservation.email !== request.user.email && 
             reservation.userId !== request.user.uid)) {
          return reply.code(403).send({ 
            error: 'No tienes permisos para modificar esta reserva' 
          });
        }
      }
      
      const updatedReservation = await reservationsService.updateReservation(id, reservationData);
      
      reply.send(updatedReservation);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Eliminar una reserva
   */
  fastify.delete('/:id', {
    ...reservationsAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Validar permisos: el usuario puede eliminar solo sus propias reservas a menos que sea admin
      if (!request.user.admin) {
        const reservation = await reservationsService.getReservationById(id);
        if (!reservation || 
            (reservation.email !== request.user.email && 
             reservation.userId !== request.user.uid)) {
          return reply.code(403).send({ 
            error: 'No tienes permisos para eliminar esta reserva' 
          });
        }
      }
      
      await reservationsService.deleteReservation(id);
      
      reply.send({ success: true, message: 'Reserva eliminada correctamente' });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = routes;
