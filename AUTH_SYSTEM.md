# Sistema de Autenticación

## Descripción General
Este proyecto implementa un sistema de autenticación completo utilizando Node.js, Fastify y Firebase Identity Platform. Permite autenticación por correo electrónico/contraseña y autenticación a través de Google.

## Componentes Principales

### 1. Plugins
- **auth.js**: Configura JWT y cookies para manejo de sesiones
- **authenticate.js**: Middleware que verifica tokens JWT y tokens de Firebase

### 2. Servicios
- **firebase.service.js**: Integración con Firebase Authentication (registro, inicio de sesión, perfil, etc.)

### 3. Rutas
- **auth.routes.js**: Endpoints de autenticación (registro, inicio de sesión, cierre de sesión, etc.)
- **index.routes.js**: Rutas generales incluyendo rutas protegidas

## Flujo de Autenticación

### Autenticación por Email/Password
1. El usuario se registra a través del endpoint `/api/auth/register`
2. El usuario inicia sesión en `/api/auth/login` y recibe un JWT
3. El token JWT se incluye en las solicitudes posteriores en el header `Authorization`
4. El plugin `authenticate.js` verifica el token en las rutas protegidas

### Autenticación con Google
1. El frontend inicia el flujo de Google con Firebase
2. Al obtener el token de Google, se envía al endpoint `/api/auth/google`
3. El servidor verifica el token y crea/actualiza el usuario en Firebase
4. Se devuelve un JWT para autenticación posterior

## Seguridad
- Los tokens JWT expiran en 1 hora
- Las cookies son httpOnly y tienen SameSite=lax
- Se verifica la autenticación en rutas protegidas mediante el middleware

## Ejemplos de Uso

### Registro de Usuario
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Inicio de Sesión
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Uso del Token
```
GET /api/protected
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configuración
El sistema utiliza variables de entorno para la configuración. Ver `.env.example` para más detalles.
