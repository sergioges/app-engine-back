const admin = require('firebase-admin');

// Use the instance already initialized in auth.service.js
// If not initialized yet, verify.
if (!admin.apps.length) {
  const config = require('../config/config');
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase)
  });
}

// Firestore initialization.
const db = admin.firestore();

/**
 * Gets a reservation by its ID.
 * @param {string} id - Reservation ID.
 * @returns {Promise<Object|null>} - Reservation data or null if it doesn't exist.
 */
async function getReservationById(id) {
  try {
    const doc = await db.collection('test-cuca').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error getting reservation: ${error.message}`);
  }
}

/**
 * Gets all reservations.
 * @returns {Promise<Array>} - List of reservations.
 */
async function getAllReservations() {
  try {
    const snapshot = await db.collection('test-cuca').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error getting reservations: ${error.message}`);
  }
}

/**
 * Gets reservations for a specific user by email.
 * @param {string} email - User's email.
 * @returns {Promise<Array>} - List of user's reservations.
 */
async function getUserReservationsByEmail(email) {
  try {
    const snapshot = await db
      .collection('test-cuca')
      .where('email', '==', email)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error getting user reservations: ${error.message}`);
  }
}

/**
 * Gets reservations for a specific user.
 * @param {string} userId - User ID.
 * @returns {Promise<Array>} - List of user's reservations.
 */
async function getUserReservations(userId) {
  try {
    // First try to search by userId (for compatibility).
    const userSnapshot = await db
      .collection('test-cuca')
      .where('userId', '==', userId)
      .get();
      
    if (!userSnapshot.empty) {
      return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    // If no results, try to get user's email.
    const userRecord = await admin.auth().getUser(userId);
    if (userRecord && userRecord.email) {
      return await getUserReservationsByEmail(userRecord.email);
    }
    
    return [];
  } catch (error) {
    throw new Error(`Error getting user reservations: ${error.message}`);
  }
}

/**
 * Creates a new reservation with the new schema.
 * @param {object} reservationData - Reservation data.
 * @returns {Promise<object>} - Created reservation data.
 */
async function createReservation(reservationData) {
  try {
    const newReservationData = {
      // Use directly provided data or set default values.
      createdAt: reservationData.createdAt || new Date().toISOString(),
      dates: reservationData.dates || [],
      email: reservationData.email,
      hosts: reservationData.hosts || 1,
      name: reservationData.name || '',
      pets: reservationData.pets || 'No',
      phone: reservationData.phone || '',
      status: reservationData.status || 'pending',
      totalNights: reservationData.totalNights || 
        (reservationData.dates ? reservationData.dates.length : 0)
    };
    
    if (reservationData.userId) {
      newReservationData.userId = reservationData.userId;
    }
    
    let docRef;
    if (reservationData.id) {
      docRef = db.collection('test-cuca').doc(reservationData.id);
      await docRef.set(newReservationData);
      return { id: reservationData.id, ...newReservationData };
    } else {
      docRef = await db.collection('test-cuca').add(newReservationData);
      return { id: docRef.id, ...newReservationData };
    }
  } catch (error) {
    throw new Error(`Error creating reservation: ${error.message}`);
  }
}

/**
 * Updates an existing reservation.
 * @param {string} reservationId - Reservation ID.
 * @param {object} reservationData - Updated data.
 * @returns {Promise<void>}
 */
async function updateReservation(reservationId, reservationData) {
  try {
    // Get current reservation to maintain fields that are not being updated.
    const reservationDoc = await db.collection('test-cuca').doc(reservationId).get();
    if (!reservationDoc.exists) {
      throw new Error(`Reservation with ID ${reservationId} doesn't exist`);
    }
    
    const currentData = reservationDoc.data();
    
    const updatedData = {
      ...currentData,
      ...reservationData,
      // If dates are updated, update totalNights as well
      totalNights: reservationData.dates 
        ? reservationData.dates.length 
        : (currentData.totalNights || 0)
    };
    
    // If status was updated, record the update date.
    if (reservationData.status && reservationData.status !== currentData.status) {
      updatedData.statusUpdatedAt = new Date().toISOString();
    }
    
    await db
      .collection('test-cuca')
      .doc(reservationId)
      .update(updatedData);
      
    return { id: reservationId, ...updatedData };
  } catch (error) {
    throw new Error(`Error updating reservation: ${error.message}`);
  }
}

/**
 * Deletes a reservation.
 * @param {string} reservationId - Reservation ID.
 * @returns {Promise<void>}
 */
async function deleteReservation(reservationId) {
  try {
    await db.collection('test-cuca').doc(reservationId).delete();
  } catch (error) {
    throw new Error(`Error deleting reservation: ${error.message}`);
  }
}

module.exports = {
  getReservationById,
  getAllReservations,
  getUserReservationsByEmail,
  getUserReservations,
  createReservation,
  updateReservation,
  deleteReservation
};
