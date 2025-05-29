const admin = require('firebase-admin');
const config = require('../config/config');
const fetch = require('node-fetch');

// Initialize Firebase Admin SDK.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase)
  });
}

const auth = admin.auth();

/**
 * Create a new user in Firebase.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<UserRecord>} - Firebase user record.
 */
async function createUser(email, password) {
  try {
    return await auth.createUser({
      email,
      password,
      emailVerified: false
    });
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
}

/**
 * Sign in with email and password.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<object>} - User token information.
 */
async function signInWithEmailAndPassword(email, password) {
  try {
    // Since Firebase Admin SDK doesn't support sign in, we verify if the user exists.
    // By this, it avoids to expose API key in server side.
    const user = await auth.getUserByEmail(email);
    
    // Generate a custom token for the user.
    const token = await auth.createCustomToken(user.uid);
    
    return { 
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      }, 
      token 
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Verify user token - Handles both ID tokens and custom tokens.
 * @param {string} token - Firebase token.
 * @returns {Promise<object>} - Decoded token or user data.
 */
async function verifyToken(token) {    
  try {
    // Decode the token payload.
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    if (payload.uid) {
      const userRecord = await auth.getUser(payload.uid);
      
      // Return user data in a similar format as verifyIdToken.
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        email_verified: userRecord.emailVerified,
        name: userRecord.displayName,
        picture: userRecord.photoURL,
        auth_time: Math.floor(Date.now() / 1000),
        custom_token: true
      };
    }
    
    throw new Error('Invalid token format: no UID found');
  } catch (customTokenError) {
    throw new Error(`Custom token verification failed: ${customTokenError.message}`);
  }
}

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Promise<UserRecord>} - Firebase user record
 */
async function getUserByUid(uid) {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    throw new Error(`Error retrieving user: ${error.message}`);
  }
}

/**
 * Update user profile.
 * @param {string} uid - User ID.
 * @param {object} userData - User data to update.
 * @returns {Promise<UserRecord>} - Updated Firebase user record.
 */
async function updateUser(uid, userData) {
  try {
    return await auth.updateUser(uid, userData);
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}

/**
 * Delete user account.
 * @param {string} uid - User ID.
 * @returns {Promise<void>}
 */
async function deleteUser(uid) {
  try {
    return await auth.deleteUser(uid);
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
}

module.exports = {
  createUser,
  signInWithEmailAndPassword,
  verifyToken,
  getUserByUid,
  updateUser,
  deleteUser
};
