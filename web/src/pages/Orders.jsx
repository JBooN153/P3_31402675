import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderService.getOrders(currentPage, 10);
      // response.data contiene { items, meta } según el backend
      const data = response.data || response;
      setOrders(data.items || data.orders || []);
      setTotalPages(data.meta?.totalPages || data.pagination?.pages || 1);
    } catch (err) {
      setError('Error al cargar las órdenes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: 'Pendiente',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado',
      PAYMENT_FAILED: 'Pago Fallido',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#fbbf24',
      COMPLETED: '#34d399',
      CANCELED: '#f87171',
      PAYMENT_FAILED: '#f87171',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 Mis Órdenes</h1>
        <p className="orders-subtitle">Aquí puedes ver el historial de tus compras</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📭</div>
          <h2>No tienes órdenes aún</h2>
          <p>Cuando realices una compra, aparecerá aquí</p>
        </div>
      ) : (
        <>
          <div className="orders-container">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-title">
                    <h3>Orden #{order.id}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusBadge(order.status)}
                    </span>
                  </div>
                  <button 
                    className="expand-btn"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {expandedOrderId === order.id ? '▼' : '▶'}
                  </button>
                </div>

                <div className="order-summary">
                  <div className="summary-item">
                    <span className="label">📅 Fecha:</span>
                    <span className="value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">💳 Método:</span>
                    <span className="value">{order.paymentMethod}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">💰 Total:</span>
                    <span className="value total">S/. {(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details-expanded">
                    <div className="items-section">
                      <h4>📦 Productos en esta orden:</h4>
                      {order.items && order.items.length > 0 ? (
                        <div className="items-list">
                          {order.items.map((item) => (
                            <div key={item.id} className="item-row">
                              <div className="item-info">
                                <div className="product-name">
                                  {item.product?.name || `Producto ${item.productId}`}
                                </div>
                                {item.product?.developer && (
                                  <div className="product-author">
                                    Desarrollador: {item.product.developer}
                                  </div>
                                )}
                                {item.product?.genre && (
                                  <div className="product-genre">
                                    Género: {item.product.genre}
                                  </div>
                                )}
                              </div>
                              <div className="item-quantity">
                                Cantidad: <strong>{item.quantity}</strong>
                              </div>
                              <div className="item-price">
                                S/. {(item.unitPrice || 0).toFixed(2)} c/u
                              </div>
                              <div className="item-subtotal">
                                <strong>S/. {(item.subtotal || 0).toFixed(2)}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-items">Sin detalles de productos</p>
                      )}
                    </div>



                    <div className="transaction-info">
                      <h4>🔑 Información de transacción:</h4>
                      <p>
                        <strong>ID de Transacción:</strong><br />
                        <code>{order.transactionId}</code>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Anterior
              </button>

              <div className="pagination-info">
                Página {currentPage} de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
