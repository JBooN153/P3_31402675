import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import '../styles/Navbar.css';
import authService from '../services/authService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getTotalItems, clearCart } = useCart();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    setShowAdminMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">🎮 PS4 Games</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/productos" className="nav-link">
            Productos
          </Link>

          {user ? (
            <>
              <Link to="/carrito" className="nav-link cart-link">
                🛒 Carrito ({getTotalItems()})
              </Link>
              <Link to="/perfil" className="nav-link">
                👤 Perfil
              </Link>
              <Link to="/ordenes" className="nav-link">
                📦 Mis Órdenes
              </Link>

              {/* 🔑 BOTÓN DE ADMIN - Solo visible para admins */}
              {user.isAdmin && (
                <div className="admin-menu-container">
                  <button 
                    className="nav-link admin-btn"
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                  >
                    ⚙️ Admin
                  </button>
                  
                  {showAdminMenu && (
                    <div className="admin-dropdown">
                      <Link 
                        to="/admin" 
                        className="admin-dropdown-item"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link 
                        to="/admin/juegos" 
                        className="admin-dropdown-item"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        🎮 Juegos
                      </Link>
                      <Link 
                        to="/admin/categorias" 
                        className="admin-dropdown-item"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        🏷️ Categorías
                      </Link>
                      <Link 
                        to="/admin/etiquetas" 
                        className="admin-dropdown-item"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        🔖 Etiquetas
                      </Link>
                      <Link 
                        to="/admin/usuarios" 
                        className="admin-dropdown-item"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        👥 Usuarios
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button className="nav-button logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">
                Login
              </Link>
              <Link to="/registro" className="nav-button primary">
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
