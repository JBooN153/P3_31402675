import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h1>Mi Carrito de Compras</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <button onClick={() => navigate('/productos')} className="continue-shopping">
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    {item.developer && <div className="item-author">{item.developer}</div>}
                  </div>

                  <div className="item-price-cell">
                    <div className="item-price-label">Precio</div>
                    <div className="item-price-value">$/. {item.price.toFixed(2)}</div>
                  </div>

                  <div className="quantity-section">
                    <div className="quantity-label">Cantidad (Max: {item.stock})</div>
                    <input
                      type="number"
                      min="1"
                      max={item.stock || 0}
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value > (item.stock || 0)) {
                          updateQuantity(item.id, item.stock);
                        } else {
                          updateQuantity(item.id, value);
                        }
                      }}
                      className="quantity-input"
                    />
                    {item.quantity === item.stock && item.stock > 0 && (
                      <small className="stock-limit-warning">↑ Límite de stock alcanzado</small>
                    )}
                  </div>

                  <div className="subtotal-cell">
                    <div className="subtotal-label">Subtotal</div>
                    <div className="subtotal-value">$/. {(item.price * item.quantity).toFixed(2)}</div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Resumen del Pedido</h3>

              <div className="summary-item total">
                <span className="summary-item-label">Total:</span>
                <span className="summary-item-value">$/. {getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="cart-buttons">
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceder al Pago
                </button>

                <button
                  className="continue-shopping-btn"
                  onClick={() => navigate('/productos')}
                >
                  Continuar Comprando
                </button>

                <button
                  className="clear-cart-btn"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                      clearCart();
                    }
                  }}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
