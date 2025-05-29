// Configuración de Firebase para el cliente
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// Los puedes obtener en la consola de Firebase:
// 1. Ve a la consola de Firebase (https://console.firebase.google.com)
// 2. Selecciona tu proyecto
// 3. Haz clic en "Configuración del proyecto" (icono de engranaje)
// 4. En la pestaña "General", desplázate hasta "Tus aplicaciones" y selecciona la aplicación web
// 5. Copia los valores de firebaseConfig

// NOTA: Para que funcione la autenticación con Google, debes habilitar el proveedor Google en:
// Firebase Console > Authentication > Sign-in method > Google > Enable

// En el navegador debes incluir directamente los valores,
// no puedes acceder a process.env como en Node.js
const firebaseConfig = {
  apiKey: process.env.GOOGLE_LOGIN_API_KEY,
  authDomain: process.env.GOOGLE_LOGIN_AUTH_DOMAIN,
  projectId: process.env.GOOGLE_LOGIN_PROJECT_ID,
  storageBucket: process.env.GOOGLE_LOGIN_STORAGE_BUCKET,
  messagingSenderId: process.env.GOOGLE_LOGIN_MESSAGING_SENDER_ID,
  appId: process.env.GOOGLE_LOGIN_APP_ID
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
