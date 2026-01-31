import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Usar usuario del localStorage si existe
          const localUser = authService.getLocalUser();
          if (localUser) {
            setUser(localUser);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const user = authService.getLocalUser();
      setUser(user);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.message || err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.message || err.response?.data?.message || err.message || 'Error al registrarse';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

