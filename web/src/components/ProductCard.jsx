import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const result = addToCart(product, quantity);
    if (result && result.success === false) {
      // show temporary message by reusing added state to indicate error
      setAdded(false);
      alert(result.message || 'Debes iniciar sesión');
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x400?text=Sin+Imagen'}
          alt={product.name}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.developer && <p className="product-author">Desarrollador: {product.developer}</p>}
        {product.platform && <p className="product-author">Plataforma: {product.platform}</p>}

        <p className="product-category">
          {product.category?.name || product.categoryName || 'Sin categoría'}
        </p>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-footer">
          <span className="product-price">$ {(Number(product.price) || 0).toFixed(2)}</span>

          <div className="product-stock">
            <span className={`stock ${product.stock > 0 ? 'available' : 'unavailable'}`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
            </span>
          </div>
        </div>

        {product.stock > 0 ? (
          <div className="product-actions">
            <select
              className="quantity-selector"
              value={quantity}
              onChange={handleQuantityChange}
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <button
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? '✓ Agregado' : 'Agregar al Carrito'}
            </button>
          </div>
        ) : (
          <button className="add-to-cart-btn disabled" disabled>
            No disponible
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
