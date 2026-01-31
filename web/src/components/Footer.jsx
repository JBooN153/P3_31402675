import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Sobre Nosotros</h4>
          <p>Tu tienda en línea de confianza para los mejores productos.</p>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: PS4Games@gmail.com</p>
          <p>Teléfono: +58-04164333333</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/productos">Productos</a></li>
            <li><a href="/terminos">Términos y Condiciones</a></li>
            <li><a href="/privacidad">Privacidad</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 PS4 Games Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
