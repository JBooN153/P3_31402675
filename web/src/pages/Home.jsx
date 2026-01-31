import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>LGM GAMESTORE</h1>
          <p>Compra juegos con seguridad • Envío rápido • Garantía 100%</p>
          <Link to="/productos" className="cta-button">
            Explorar Juegos
          </Link>
        </div>
      </section>

      <section className="benefits-banner">
        <div className="benefit-item">
          <div className="benefit-icon">🎮</div>
          <div className="benefit-text">
            <h4>Selección Premium</h4>
            <p>Mejores juegos</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🔒</div>
          <div className="benefit-text">
            <h4>Compras Seguras</h4>
            <p>Pagos protegidos</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">⚡</div>
          <div className="benefit-text">
            <h4>Acceso Inmediato</h4>
            <p>Descarga instant</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🏆</div>
          <div className="benefit-text">
            <h4>Mejor Precio</h4>
            <p>Ofertas competitivas</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
