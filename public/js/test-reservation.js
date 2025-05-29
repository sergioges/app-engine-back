// Script específico para la página de prueba de reservaciones

document.addEventListener('DOMContentLoaded', function() {
    const userInfoEl = document.getElementById('userInfo');
    const resultEl = document.getElementById('result');
    const createDirectBtn = document.getElementById('createDirectBtn');
    const createApiBtn = document.getElementById('createApiBtn');
    const getReservationsBtn = document.getElementById('getReservationsBtn');

    // Datos para la reserva de prueba
    const testReservation = {
        dates: [
            new Date("2025-06-25T00:00:00.000Z").toISOString(),
            new Date("2025-06-26T00:00:00.000Z").toISOString(),
            new Date("2025-06-27T00:00:00.000Z").toISOString()
        ],
        email: "", // Se establecerá con el email del usuario logueado
        hosts: 3,
        name: "Reserva de Prueba",
        pets: "Sí",
        phone: "555-123-4567",
        status: "pending",
        createdAt: new Date().toISOString(),
        totalNights: 3
    };
    
    // Verificar autenticación - Método mejorado
    checkAuthStatus();
    
    function checkAuthStatus() {
        // 1. Verificar token en localStorage (como en index.html)
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            showUnauthenticatedUI();
            return;
        }
        
        // 2. Verificar el estado de autenticación en Firebase
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log("Usuario autenticado:", user.email);
                showAuthenticatedUI(user);
            } else {
                // Si Firebase no reconoce al usuario pero tenemos token, 
                // intentar usar el token para identificar al usuario
                verifyServerToken(token);
            }
        });
    }
    
    // Verificar token con el servidor
    async function verifyServerToken(token) {
        try {
            const response = await fetch('/api/auth/status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.authenticated) {
                    // El token es válido, mostrar UI autenticada
                    showAuthenticatedUI({
                        email: data.user.email,
                        uid: data.user.uid
                    });
                    return;
                }
            }
            
            // Si llegamos aquí, el token no es válido
            showUnauthenticatedUI();
            
        } catch (error) {
            console.error("Error verificando token:", error);
            showUnauthenticatedUI();
        }
    }
    
    // Mostrar UI para usuario autenticado
    function showAuthenticatedUI(user) {
        userInfoEl.innerHTML = `
            <p><strong>Usuario autenticado:</strong> ${user.email}</p>
            <p><strong>UID:</strong> ${user.uid}</p>
            <button id="logoutBtn">Cerrar sesión</button>
        `;
        
        // Actualizar el email en la reserva de prueba
        testReservation.email = user.email;
        
        // Habilitar botones
        createDirectBtn.disabled = false;
        createApiBtn.disabled = false;
        getReservationsBtn.disabled = false;
        
        // Agregar manejador de cierre de sesión
        document.getElementById('logoutBtn').addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('authToken');
                window.location.href = 'index.html';
            }).catch(error => {
                resultEl.innerHTML = `<span class="error">Error al cerrar sesión: ${error.message}</span>`;
            });
        });
    }
    
    // Mostrar UI para usuario no autenticado
    function showUnauthenticatedUI() {
        userInfoEl.innerHTML = '<p>No has iniciado sesión. Por favor, <a href="index.html">inicia sesión</a> primero.</p>';
        createDirectBtn.disabled = true;
        createApiBtn.disabled = true;
        getReservationsBtn.disabled = true;
    }
            
    // Crear reserva directamente con Firestore
    createDirectBtn.addEventListener('click', async function() {
        try {
            resultEl.innerHTML = 'Creando reserva directamente en Firestore...';
            const db = firebase.firestore();
            
            // Añadir la reserva a Firestore
            const docRef = await db.collection('reservations').add(testReservation);
            
            // Obtener la reserva creada
            const docSnap = await docRef.get();
            
            resultEl.innerHTML = `<span class="success">Reserva creada correctamente.</span>\n\nID: ${docRef.id}\n\n${JSON.stringify(docSnap.data(), null, 2)}`;
        } catch (error) {
            resultEl.innerHTML = `<span class="error">Error al crear la reserva: ${error.message}</span>`;
            console.error('Error completo:', error);
        }
    });
            
    // Crear reserva a través de la API
    createApiBtn.addEventListener('click', async function() {
        try {
            resultEl.innerHTML = 'Creando reserva mediante la API...';
            
            // Obtener token almacenado
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
            
            // Hacer la solicitud a la API
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testReservation)
            });
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            resultEl.innerHTML = `<span class="success">Reserva creada correctamente mediante API.</span>\n\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultEl.innerHTML = `<span class="error">Error al crear la reserva mediante API: ${error.message}</span>`;
            console.error('Error completo:', error);
        }
    });
            
    // Obtener mis reservas
    getReservationsBtn.addEventListener('click', async function() {
        try {
            resultEl.innerHTML = 'Obteniendo mis reservas...';
            
            // Obtener token almacenado
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
            
            // Hacer la solicitud a la API
            const response = await fetch('/api/reservations/my', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            resultEl.innerHTML = `<span class="success">Reservas obtenidas correctamente.</span>\n\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultEl.innerHTML = `<span class="error">Error al obtener reservas: ${error.message}</span>`;
            console.error('Error completo:', error);
        }
    });
});
