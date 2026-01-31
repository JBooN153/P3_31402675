import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return {
    user: context.user,
    loading: context.loading,
    error: context.error,
    login: context.login,
    logout: context.logout,
    register: context.register,
  };
};
