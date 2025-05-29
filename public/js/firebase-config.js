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
  apiKey: "AIzaSyAIhVz4D3rP-HjkoUubC1d07yHbOERFydc",
  authDomain: "reservas-cuca-de-llum.web.app",
  projectId: "reservas-cuca-de-llum",
  storageBucket: "reservas-cuca-de-llum.firebasestorage.app",
  messagingSenderId: "615565367020",
  appId: "1:615565367020:web:0f5061a2acc03c4ae3b7c9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
