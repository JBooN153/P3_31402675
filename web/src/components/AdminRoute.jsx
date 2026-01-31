import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * AdminRoute - Protege rutas solo para admins
 * 
 * Un usuario solo accede a rutas admin si:
 * 1. Está autenticado (tiene token)
 * 2. Su email está en la lista blanca (ADMIN_EMAILS)
 * 
 * Si no cumple, lo redirige a home
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Si no está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si no es admin (email no en lista blanca)
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Si es admin, mostrar contenido
  return children;
};

export default AdminRoute;
