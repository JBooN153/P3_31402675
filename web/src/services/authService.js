import apiClient from './api';
import { isUserAdmin } from '../utils/adminWhitelist';

const authService = {
  login: async (User) => {
    const response = await apiClient.post('/auth/login', User);
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      // Guardar datos del usuario
      const user = { 
        id: response.data.data.user?.id,
        email: response.data.data.user?.email,
        nombre: response.data.data.user?.nombre,
        isAdmin: isUserAdmin(response.data.data.user) // ✅ Verificar si es admin
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getLocalUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },
};

export default authService;

