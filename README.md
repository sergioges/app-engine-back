# Sistema de Autenticación con Node.js, Fastify y Firebase

Este proyecto implementa un sistema completo de autenticación utilizando Node.js con Fastify como framework y Firebase Identity Platform para la gestión de usuarios.

## Características

- Registro de usuarios con email y contraseña
- Login/Logout con JWT
- Autenticación con Google
- Verificación dual de tokens (JWT local y Firebase)
- Rutas protegidas
- Gestión de cookies para sesiones
- Perfil de usuario (ver y actualizar)
- Detección inteligente del tipo de token
- Endpoint para verificar estado de autenticación

## Requisitos previos

- Node.js (v16 o superior) y npm
- Cuenta en Firebase
- Git (opcional)

## Guía de instalación paso a paso

### 1. Clonar el repositorio

```bash
# Opción 1: Si usas Git
git clone <url-del-repositorio>
cd nombre-de-la-carpeta

# Opción 2: Si descargas el proyecto como ZIP
# Descomprime el archivo y navega a la carpeta del proyecto
cd nombre-de-la-carpeta
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

#### 3.1 Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Añadir proyecto" y sigue las instrucciones
3. Una vez creado, haz clic en "Añadir Firebase a tu aplicación web" y guarda la configuración

#### 3.2 Configurar la autenticación en Firebase

1. En la consola de Firebase, ve a "Authentication" > "Sign-in method"
2. Habilita el método "Correo electrónico/contraseña" y guarda los cambios
3. Para usar la autenticación con Google:
   - Habilita el proveedor "Google" 
   - Configura el nombre del proyecto que se mostrará a los usuarios
   - Si necesitas personalizar el OAuth, configura el ID de cliente y secreto de Google (opcional)
   - Guarda los cambios

#### 3.3 Crear una cuenta de servicio para Firebase Admin SDK

1. En la consola de Firebase, ve a Configuración del proyecto > Cuentas de servicio
2. Haz clic en "Generar nueva clave privada"
3. Guarda el archivo JSON descargado de forma segura

### 4. Configurar variables de entorno

```bash
# Crea un archivo .env basado en .env.example
cp .env.example .env
```

Abre el archivo `.env` y configura las siguientes variables:

```
# Firebase Admin SDK (usa los valores del archivo JSON descargado)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="tu-clave-privada"
FIREBASE_CLIENT_EMAIL=tu-email-cliente
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=tu-client-cert-url

# Seguridad (crea tus propias claves secretas)
JWT_SECRET=genera-una-clave-secreta-aleatoria-aqui
COOKIE_SECRET=genera-otra-clave-secreta-aleatoria-aqui
PORT=3000
```

Para generar claves secretas aleatorias seguras, puedes usar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Configurar Firebase en el frontend

1. Edita el archivo `public/js/firebase-config.js` y reemplaza los valores de ejemplo con los de tu proyecto:
   ```javascript
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "TU_MESSAGING_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

   > **IMPORTANTE**: A diferencia del backend, estos valores deben incluirse directamente en el archivo, NO usar `process.env` porque no funciona en el navegador.

2. Estos valores los encontrarás en:
   - Firebase Console > Configuración del proyecto > General
   - En la sección "Tus aplicaciones", selecciona la aplicación web o crea una nueva

### 6. Iniciar la aplicación

#### En modo desarrollo (con recarga automática):

```bash
npm run dev
```

#### En modo producción:

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## Estructura del proyecto

```
├── index.js                # Punto de entrada principal
├── AUTH_SYSTEM.md          # Documentación detallada del sistema de autenticación
├── init-sample-data.js     # Script para inicializar datos de prueba en Firestore
├── create-test-user.js     # Script para crear usuarios de prueba
├── public/                 # Archivos estáticos y frontend
│   ├── index.html          # Página HTML principal
│   └── js/
│       ├── auth.js            # Lógica de autenticación del cliente
│       └── firebase-config.js # Configuración de Firebase para el cliente
├── src/
│   ├── config/             # Configuración de la aplicación
│   │   └── config.js       # Configuración general y Firebase Admin
│   ├── plugins/            # Plugins de Fastify
│   │   ├── auth.js         # Plugin de JWT y cookies
│   │   └── authenticate.js # Plugin de autenticación
│   ├── routes/             # Definición de rutas API
│   │   ├── auth.routes.js      # Rutas de autenticación
│   │   ├── index.routes.js     # Rutas generales
│   │   └── reservations.routes.js # Rutas para gestión de reservas
│   └── services/           # Servicios de la aplicación
│       ├── auth.service.js        # Servicio de autenticación con Firebase
│       └── reservations.service.js # Servicio para gestión de reservas en Firestore
```

## Probar la aplicación

1. Abre tu navegador y ve a `http://localhost:3000`
2. Puedes autenticarte de varias formas:
   - Crea una cuenta nueva utilizando la pestaña "Registrarse"
   - Inicia sesión con email y contraseña
   - Usa el botón "Iniciar sesión con Google" para autenticarte con tu cuenta de Google
3. Una vez autenticado, explora las funcionalidades de perfil y rutas protegidas
4. Prueba a cerrar sesión y volver a iniciarla usando diferentes métodos

## API Endpoints

### Autenticación

| Método | Ruta | Descripción | Datos requeridos |
|--------|------|-------------|-----------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | `{ "email": "usuario@ejemplo.com", "password": "contraseña" }` |
| POST | `/api/auth/login` | Iniciar sesión | `{ "email": "usuario@ejemplo.com", "password": "contraseña" }` |
| POST | `/api/auth/google` | Iniciar sesión con Google | `{ "idToken": "token-id-de-google" }` |
| POST | `/api/auth/logout` | Cerrar sesión | Token JWT en Authorization header |
| GET | `/api/auth/me` | Obtener perfil de usuario | Token JWT en Authorization header |
| PUT | `/api/auth/me` | Actualizar perfil | `{ "displayName": "Nombre", "photoURL": "https://..." }` |

### Rutas generales

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api` | Ruta de bienvenida | No requerida |
| GET | `/api/protected` | Contenido protegido | Token JWT requerido |

### API de Reservas

| Método | Ruta | Descripción | Autenticación | Datos requeridos |
|--------|------|-------------|---------------|-----------------|
| GET | `/api/reservations` | Obtener todas las reservas | Requerida | - |
| GET | `/api/reservations/my` | Obtener reservas del usuario actual | Requerida | - |
| POST | `/api/reservations` | Crear nueva reserva | Requerida | `{ "date": "2025-05-25", "time": "09:00", "duration": 2, "notes": "Descripción" }` |
| PUT | `/api/reservations/:id` | Actualizar reserva | Requerida | `{ "date": "2025-05-25", "time": "10:00", "duration": 1, "notes": "Nueva descripción", "status": "confirmed" }` |
| DELETE | `/api/reservations/:id` | Eliminar reserva | Requerida | - |

## Solución de problemas

### Error de conexión con Firebase

Verifica que:
- Las credenciales en el archivo `.env` sean correctas
- El objeto `firebaseConfig` en `src/config/config.js` esté bien formateado
- El servicio Firebase Admin SDK esté correctamente inicializado

### Problemas con la autenticación de Google

Si la autenticación con Google no funciona, verifica que:
1. El proveedor Google esté habilitado en Firebase Console > Authentication > Sign-in method
2. La configuración en `public/js/firebase-config.js` sea correcta y tenga todos los valores necesarios
3. No haya errores de CORS o restricciones de dominio en tu configuración de Firebase
4. Tu navegador no esté bloqueando ventanas emergentes durante el proceso de autenticación

### Error con el plugin fastify-jwt

Si obtienes errores al registrar el plugin fastify-jwt, verifica que:
1. La versión del paquete sea compatible con tu versión de Fastify
2. La clave secreta JWT_SECRET esté correctamente configurada en el `.env`

## Seguridad

Este proyecto implementa:
- Múltiples métodos de autenticación (email/contraseña y Google)
- Tokens JWT para sesiones y autenticación
- Cookies HTTP-only para mayor seguridad
- Verificación de tokens en Firebase
- Manejo de errores específicos para autenticación
- Protección de rutas sensibles

## Licencia

MIT
