/**
 * Script para crear una reserva mediante la línea de comandos
 * Este script obtiene un token de Firebase Auth y luego usa la API para crear una reserva
 */
require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
const config = require('./src/config/config');

// Inicializar Firebase Admin SDK si aún no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase)
  });
}

// Email del usuario para el cual crear la reserva
// Puedes cambiarlo al email del usuario que has usado para iniciar sesión
const USER_EMAIL = 'test@example.com'; // ¡Cambia esto al email de tu usuario!

async function createReservation() {
  try {
    console.log(`🔄 Obteniendo usuario por email: ${USER_EMAIL}`);
    
    // Buscar el usuario por email
    const userRecord = await admin.auth().getUserByEmail(USER_EMAIL);
    console.log(`✅ Usuario encontrado: ${userRecord.uid}`);
    
    // Crear un token personalizado para el usuario
    const token = await admin.auth().createCustomToken(userRecord.uid);
    console.log(`✅ Token creado: ${token.substring(0, 20)}...`);
    
    // Datos para la reserva
    const reservationData = {
      dates: [
        new Date("2025-07-10T00:00:00.000Z").toISOString(),
        new Date("2025-07-11T00:00:00.000Z").toISOString(),
        new Date("2025-07-12T00:00:00.000Z").toISOString()
      ],
      email: USER_EMAIL,
      hosts: 2,
      name: "Reserva desde Script",
      pets: "No",
      phone: "555987654",
      status: "pending",
      createdAt: new Date().toISOString(),
      totalNights: 3
    };
    
    console.log('📋 Datos de la reserva:');
    console.log(JSON.stringify(reservationData, null, 2));
    
    console.log('\n🔄 Creando reserva mediante la API...');
    // Obtener el ID token a partir del custom token (simulando al cliente)
    // Como no podemos hacer esto directamente en Node, usaremos Firestore directamente
    
    // Crear directamente en Firestore
    const db = admin.firestore();
    const docRef = await db.collection('reservations').add(reservationData);
    console.log(`✅ Reserva creada con ID: ${docRef.id}`);
    
    // Verificar que se guardó
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log('📝 Datos guardados en la base de datos:');
      console.log({ id: docSnap.id, ...docSnap.data() });
    }
    
    console.log('\n✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createReservation();
