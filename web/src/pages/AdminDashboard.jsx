import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Admin.css'

const AdminDashboard = () => {
    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>⚙️ Panel de Administración</h1>
                    <p className="subtitle">Gestiona todos los aspectos de tu tienda</p>
                </div>
            </header>

            <div className="dashboard-grid">
                <Link to="/admin/usuarios" className="dashboard-card users-card">
                    <div className="card-icon">👥</div>
                    <h3>Usuarios</h3>
                    <p>Gestiona los usuarios registrados del sistema</p>
                    <span className="card-action">Ir →</span>
                </Link>

                <Link to="/admin/categorias" className="dashboard-card categories-card">
                    <div className="card-icon">📁</div>
                    <h3>Categorías</h3>
                    <p>Crea y edita categorías de juegos PS4</p>
                    <span className="card-action">Ir →</span>
                </Link>

                <Link to="/admin/etiquetas" className="dashboard-card tags-card">
                    <div className="card-icon">🏷️</div>
                    <h3>Etiquetas</h3>
                    <p>Gestiona las etiquetas para clasificar juegos</p>
                    <span className="card-action">Ir →</span>
                </Link>

                <Link to="/admin/juegos" className="dashboard-card products-card">
                    <div className="card-icon">🎮</div>
                    <h3>Juegos</h3>
                    <p>Administra el catálogo de juegos PS4 disponibles</p>
                    <span className="card-action">Ir →</span>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard
