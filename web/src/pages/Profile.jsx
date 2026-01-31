import React from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mi Perfil</h1>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">👤</div>
            <h2>{user?.nombre || 'Usuario'}</h2>
          </div>

          <div className="profile-info">
            <div className="info-group">
              <label>Email:</label>
              <p>{user?.email || 'No disponible'}</p>
            </div>

            <div className="info-group">
              <label>Usuario Desde:</label>
              <p>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'No disponible'}
              </p>
            </div>

            <div className="info-group">
              <label>Estado:</label>
              <p>
                <span className="status-active">✓ Activo</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
