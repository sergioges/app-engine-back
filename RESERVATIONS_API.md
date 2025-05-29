# API de Reservas con Firestore

Este documento describe la API de reservas implementada con Node.js, Fastify y Firebase Firestore.

## Introducción

Esta API permite gestionar reservas almacenadas en Firestore, con protección de autenticación mediante Firebase Auth. Solo los usuarios autenticados pueden acceder a los recursos.

## Modelo de datos

### Reservas (Collection: `reservations`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String | ID único generado por Firestore |
| `createdAt` | String | Fecha y hora de creación en formato ISO |
| `dates` | Array<String> | Lista de fechas reservadas en formato ISO |
| `email` | String | Email del usuario que realizó la reserva |
| `hosts` | Number | Número de personas que se hospedarán |
| `name` | String | Nombre de la persona que realizó la reserva |
| `pets` | String | Indica si llevará mascotas ("Sí" o "No") |
| `phone` | String | Número de teléfono de contacto |
| `status` | String | Estado: "pending", "confirmed", o "cancelled" |
| `totalNights` | Number | Número total de noches de la estancia |
| `statusUpdatedAt` | String | Fecha y hora de la última actualización de estado (opcional) |
| `userId` | String | ID del usuario que creó la reserva (opcional, para compatibilidad) |

## Endpoints

### GET /api/reservations

Obtiene todas las reservas.

#### Autenticación
- Requiere token de autenticación en el header `Authorization: Bearer {token}`

#### Respuesta
```json
{
  "reservations": [
    {
      "id": "abcdef123456",
      "createdAt": "2025-05-20T18:18:14.267Z",
      "dates": [
        "2025-06-10T00:00:00.000Z",
        "2025-06-11T00:00:00.000Z",
        "2025-06-12T00:00:00.000Z"
      ],
      "email": "usuario1@example.com",
      "hosts": 2,
      "name": "Juan Pérez",
      "pets": "No",
      "phone": "555123456",
      "status": "confirmed",
      "totalNights": 3
    },
    // ... más reservas
  ]
}
```

### GET /api/reservations/my

Obtiene solo las reservas del usuario autenticado.

#### Autenticación
- Requiere token de autenticación en el header `Authorization: Bearer {token}`

#### Respuesta
```json
{
  "reservations": [
    {
      "id": "abcdef123456",
      "createdAt": "2025-05-22T10:25:30.000Z",
      "dates": [
        "2025-06-20T00:00:00.000Z",
        "2025-06-21T00:00:00.000Z"
      ],
      "email": "usuario1@example.com",
      "hosts": 3,
      "name": "Juan Pérez",
      "pets": "Sí",
      "phone": "555123456",
      "status": "pending",
      "totalNights": 2
    },
    // ... más reservas del usuario
  ]
}
```

### POST /api/reservations

Crea una nueva reserva.

#### Autenticación
- Requiere token de autenticación en el header `Authorization: Bearer {token}`

#### Request Body
```json
{
  "id": "bW8hoxc3E0yYx0kaQRQ7",
  "dates": [
    "2025-06-10T00:00:00.000Z",
    "2025-06-11T00:00:00.000Z", 
    "2025-06-12T00:00:00.000Z"
  ],
  "name": "Juan Pérez",
  "email": "usuario1@example.com",
  "phone": "555123456",
  "hosts": 2,
  "pets": "No",
  "status": "pending",
  "totalNights": 4,
  "createdAt": "2025-05-23T14:30:00.000Z"
}
```

#### Respuesta
```json
{
  "id": "bW8hoxc3E0yYx0kaQRQ7",
  "createdAt": "2025-05-23T14:30:00.000Z"
  "dates": [
    "2025-06-10T00:00:00.000Z",
    "2025-06-11T00:00:00.000Z",
    "2025-06-12T00:00:00.000Z"
  ],
  "email": "usuario1@example.com",
  "hosts": 2,
  "name": "Juan Pérez",
  "pets": "No",
  "phone": "555123456",
  "status": "pending",
  "totalNights": 4,
}
```

### PUT /api/reservations/:id

Actualiza una reserva existente.

#### Autenticación
- Requiere token de autenticación en el header `Authorization: Bearer {token}`

#### Request Params
- `id`: ID de la reserva a actualizar

#### Request Body
```json
{
  "dates": [
    "2025-06-15T00:00:00.000Z",
    "2025-06-16T00:00:00.000Z"
  ],
  "hosts": 3,
  "status": "confirmed"
}
```

#### Respuesta
```json
{
  "id": "bW8hoxc3E0yYx0kaQRQ7",
  "createdAt": "2025-05-23T14:30:00.000Z"
  "dates": [
    "2025-06-10T00:00:00.000Z",
    "2025-06-11T00:00:00.000Z",
    "2025-06-12T00:00:00.000Z"
  ],
  "email": "usuario1@example.com",
  "hosts": 2,
  "name": "Juan Pérez",
  "pets": "No",
  "phone": "555123456",
  "status": "pending",
  "totalNights": 4,
}
```

### DELETE /api/reservations/:id

Elimina una reserva.

#### Autenticación
- Requiere token de autenticación en el header `Authorization: Bearer {token}`

#### Request Params
- `id`: ID de la reserva a eliminar

#### Respuesta
```json
{
  "success": true,
  "message": "Reserva eliminada correctamente"
}
```

## Códigos de error

| Código | Descripción |
|--------|-------------|
| 400 | Error en la solicitud (formato incorrecto, datos inválidos) |
| 401 | Error de autenticación (token inválido o expirado) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

## Ejemplos de uso

### Crear una reserva
```bash
curl -X POST \
  http://localhost:3001/api/reservations \
  -H "Authorization: Bearer eyJhbGciOiJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "dates": [
      "2025-06-10T00:00:00.000Z", 
      "2025-06-11T00:00:00.000Z", 
      "2025-06-12T00:00:00.000Z"
    ],
    "name": "Juan Pérez",
    "email": "usuario1@example.com",
    "phone": "555123456",
    "hosts": 2,
    "pets": "No"
  }'
```

### Obtener reservas del usuario actual
```bash
curl -X GET \
  http://localhost:3001/api/reservations/my \
  -H "Authorization: Bearer eyJhbGciOiJ..."
```
