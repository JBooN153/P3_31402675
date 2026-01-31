import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'games_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito del localStorage al montar el componente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validar que sea un array
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Si hay error, limpiar localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (isLoaded) {
      try {
        if (cartItems.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product, quantity = 1) => {
    // Require user to be logged in to add to cart
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Debes iniciar sesión para agregar al carrito' };
    }

    // Validar que hay stock disponible
    if (!product.stock || product.stock <= 0) {
      return { success: false, message: 'Producto agotado' };
    }

    // Validar que la cantidad no exceda el stock
    if (quantity > product.stock) {
      return { success: false, message: `Stock insuficiente. Disponible: ${product.stock}` };
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Validar que la cantidad total no exceda el stock
        if (newQuantity > product.stock) {
          return prevItems; // No agregar, mantener cantidad actual
        }
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });

    return { success: true };
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      const itemToUpdate = prevItems.find(item => item.id === productId);
      
      if (!itemToUpdate) return prevItems;

      // Validar que la cantidad no exceda el stock disponible
      if (quantity > itemToUpdate.stock) {
        console.warn(`Cantidad solicitada (${quantity}) excede el stock disponible (${itemToUpdate.stock})`);
        // Limitar a la cantidad máxima disponible
        quantity = itemToUpdate.stock;
      }

      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing cart from localStorage:', e);
    }
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Limpiar carrito cuando el usuario cierra sesión
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue === null) {
        // Token fue removido (logout)
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
