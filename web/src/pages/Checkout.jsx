import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import orderService from '../services/orderService';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    cardNumber: '',
    fullName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    currency: 'USD',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validar que haya productos en el carrito
      if (cartItems.length === 0) {
        setError('El carrito está vacío');
        setLoading(false);
        return;
      }

      // Preparar los items para la orden
      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // Validar formulario
      if (!formData.cardNumber.trim()) {
        setError('Número de tarjeta requerido');
        setLoading(false);
        return;
      }

      if (!formData.fullName.trim()) {
        setError('Nombre completo requerido');
        setLoading(false);
        return;
      }

      if (!formData.expirationMonth || !formData.expirationYear) {
        setError('Fecha de vencimiento requerida');
        setLoading(false);
        return;
      }

      if (!formData.cvv.trim()) {
        setError('CVV requerido');
        setLoading(false);
        return;
      }

      // Crear la orden
      const response = await orderService.createOrder(items, 'CREDIT_CARD', {
        cardNumber: formData.cardNumber,
        fullName: formData.fullName,
        expirationMonth: parseInt(formData.expirationMonth, 10),
        expirationYear: parseInt(formData.expirationYear, 10),
        cvv: formData.cvv,
        currency: formData.currency,
      });

      if (response.status === 'success') {
        setSuccess('¡Pago procesado exitosamente!');
        clearCart();
        setTimeout(() => navigate('/ordenes'), 2000);
      } else {
        setError(response.message || 'Error al procesar el pago');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.message || 'Error en el checkout';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <p>El carrito está vacío</p>
          <button onClick={() => navigate('/productos')}>Ir a Productos</button>
        </div>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h1>Checkout</h1>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="checkout-form">
            <fieldset disabled={loading}>
              <h3>Detalles de Pago</h3>

              <div className="form-group">
                <label htmlFor="cardNumber">Número de Tarjeta:</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                <small>Formato: XXXX XXXX XXXX XXXX</small>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Nombre Completo:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez García"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expirationMonth">Mes Vencimiento:</label>
                  <select
                    id="expirationMonth"
                    name="expirationMonth"
                    value={formData.expirationMonth}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona mes</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expirationYear">Año Vencimiento:</label>
                  <select
                    id="expirationYear"
                    name="expirationYear"
                    value={formData.expirationYear}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona año</option>
                    {[...Array(10)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV:</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="currency">Moneda:</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="VES">VES - Bolivar Venezolano</option>
                </select>
              </div>

              <button type="submit" className="checkout-submit" disabled={loading}>
                {loading ? 'Procesando...' : `Pagar $/ ${total.toFixed(2)}`}
              </button>
            </fieldset>
          </form>

          {loading && <Loading />}
        </div>

        {/* Resumen de Orden */}
        <div className="order-summary">
          <h3>Resumen de la Orden</h3>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-detail">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">$/ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-totals">
            <div className="total-row total">
              <span>Total:</span>
              <span>$/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
