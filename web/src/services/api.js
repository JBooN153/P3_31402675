import axios from 'axios';

// Determinar la URL base según el ambiente
const getApiBaseUrl = () => {
  // En el navegador, verificar si estamos en producción
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Si hay variable de entorno VITE_API_URL, usarla (para dev con servidor externo)
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'window.location.origin') {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción o cuando el hostname no es localhost, usar la misma URL del servidor
  if (isProduction || import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // En desarrollo local, usar localhost:3000
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔌 API Base URL:', API_BASE_URL);
console.log('🌍 Hostname:', window.location.hostname);
console.log('📍 Origin:', window.location.origin);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log de error detallado
    if (error.response) {
      // Error del servidor (status !== 2xx)
      console.error('❌ Error del servidor:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Solo redirigir si ya estábamos autenticados (token existía)
        const token = localStorage.getItem('token');
        if (token) {
          // Limpiar token y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Usar replace para reemplazar la ruta sin crear historial
          window.location.replace('/login');
        }
        // Si no hay token, es un error de login normal, dejar que el componente lo maneje
      }
    } else if (error.request) {
      // Solicitud realizada pero sin respuesta
      console.error('❌ Error de conexión: No hay respuesta del servidor');
      console.error('   URL:', API_BASE_URL);
      console.error('   Asegúrate de que el servidor backend está corriendo en', API_BASE_URL);
    } else {
      // Error en la configuración de la solicitud
      console.error('❌ Error de configuración:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
