// Variables globales
let currentUser = null;
let authToken = null;

// Elementos DOM
const authContainer = document.getElementById('auth-container');
const profileContainer = document.getElementById('profile-container');
const alertContainer = document.getElementById('alert-container');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formUpdateProfile = document.getElementById('form-update-profile');
const btnLogout = document.getElementById('btn-logout');
const btnProtected = document.getElementById('btn-protected');

// Al cargar la página, verificar si hay un token en localStorage
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    console.log('Token encontrado en localStorage:', token ? 'Presente' : 'No hay token');
    
    if (token) {
        try {
            authToken = token;
            const isValid = await verifyAuthStatus();
            
            if (isValid) {
                await fetchUserProfile();
            } else {
                showLoginError('La sesión ha expirado. Por favor inicia sesión nuevamente.');
                logout();
            }
        } catch (error) {
            console.error('Error al verificar la sesión:', error);
            localStorage.removeItem('authToken');
            showAuthContainer();
        }
    }
});

/**
 * Verifica si el token es válido mediante el endpoint de estado
 */
async function verifyAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        return data.authenticated === true;
    } catch (error) {
        return false;
    }
}

// Event Listeners
formLogin.addEventListener('submit', handleLogin);
formRegister.addEventListener('submit', handleRegister);
formUpdateProfile.addEventListener('submit', handleUpdateProfile);
btnLogout.addEventListener('click', handleLogout);  // Corregido de 'submit' a 'click'
btnProtected.addEventListener('click', handleProtectedRoute);

// Funciones de autenticación
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        // Guardar token y datos del usuario
        console.log('Login exitoso - Token recibido:', data.token);
        localStorage.setItem('authToken', data.token);
        authToken = data.token;
        currentUser = data.user;
        console.log(currentUser)
        
        // Mostrar perfil
        updateProfileUI();
        showProfileContainer();
        showAlert('Sesión iniciada correctamente', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar usuario');
        }
        
        // Mostrar mensaje de éxito y cambiar al tab de login
        showAlert('Usuario registrado correctamente. Ahora puedes iniciar sesión', 'success');
        document.getElementById('login-tab').click();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function handleLogout(event) {
    event.preventDefault();
    
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        // Limpiar datos de sesión
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
        
        // Mostrar formulario de login
        showAuthContainer();
        showAlert('Sesión cerrada correctamente', 'info');
    } catch (error) {
        showAlert('Error al cerrar sesión', 'danger');
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const displayName = document.getElementById('profile-display-name').value;
    const photoURL = document.getElementById('profile-photo-url').value;
    
    try {
        const response = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                displayName: displayName || null, 
                photoURL: photoURL || null 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar perfil');
        }
        
        // Actualizar usuario actual
        currentUser = data;
        updateProfileUI();
        showAlert('Perfil actualizado correctamente', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function handleProtectedRoute() {
    try {
        // Log para depuración
        console.log('Token usado para autenticación:', authToken);
        
        const response = await fetch('/api/protected', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        console.log('Respuesta de ruta protegida:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al acceder a ruta protegida');
        }
        
        showAlert(`Ruta protegida accedida correctamente: ${data.message}`, 'info');
    } catch (error) {
        console.error('Error completo:', error);
        showAlert(error.message, 'danger');
    }
}

// Función para obtener datos del perfil
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Sesión inválida');
        }
        
        currentUser = await response.json();
        updateProfileUI();
        showProfileContainer();
    } catch (error) {
        throw error;
    }
}

// Funciones UI
function updateProfileUI() {
    document.getElementById('profile-email').textContent = currentUser.email || 'N/A';
    document.getElementById('profile-uid').textContent = currentUser.uid || 'N/A';
    document.getElementById('profile-verified').textContent = currentUser.emailVerified ? 'Sí' : 'No';
    
    document.getElementById('profile-display-name').value = currentUser.displayName || '';
    document.getElementById('profile-photo-url').value = currentUser.photoURL || '';
}

function showAuthContainer() {
    authContainer.classList.remove('hidden');
    profileContainer.classList.add('hidden');
}

function showProfileContainer() {
    authContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}
