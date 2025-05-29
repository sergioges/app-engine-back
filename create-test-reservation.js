/**
 * Script para crear una reserva de prueba con la estructura de datos actualizada
 */
const admin = require('firebase-admin');
const config = require('./src/config/config');
const reservationsService = require('./src/services/reservations.service');

// Inicializar Firebase Admin SDK si aún no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase)
  });
}

// Datos para una nueva reserva de ejemplo
const newReservation = {
  id: `test-${Date.now()}`, // Generamos un ID único con timestamp
  dates: [
    new Date("2025-06-25T00:00:00.000Z").toISOString(),
    new Date("2025-06-26T00:00:00.000Z").toISOString(),
    new Date("2025-06-27T00:00:00.000Z").toISOString()
  ],
  email: "test-user@example.com",
  hosts: 3,
  name: "Usuario de Prueba",
  pets: "Sí",
  phone: "555-123-4567",
  status: "pending",
  createdAt: new Date().toISOString(),
  totalNights: 3
};

async function createTestReservation() {
  try {
    console.log('🔄 Creando reserva de prueba...');
    console.log('📋 Datos de la reserva a crear:');
    console.log(JSON.stringify(newReservation, null, 2));
    
    // Crear la reserva usando el servicio
    const createdReservation = await reservationsService.createReservation(newReservation);
    
    console.log('\n✅ Reserva creada exitosamente:');
    console.log(JSON.stringify(createdReservation, null, 2));
    
    // Verificar que la reserva se creó correctamente
    console.log('\n🔍 Verificando reserva en la base de datos...');
    const dbReservation = await reservationsService.getReservationById(createdReservation.id);
    
    if (dbReservation) {
      console.log('✅ La reserva se encuentra en la base de datos:');
      console.log(JSON.stringify(dbReservation, null, 2));
    } else {
      console.log('❌ No se encontró la reserva en la base de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error al crear la reserva:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

createTestReservation();
