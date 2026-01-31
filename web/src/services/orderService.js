import apiClient from './api';

const orderService = {
  createOrder: async (items, paymentMethod, cardDetails) => {
    const response = await apiClient.post('/v2/orders', {
      items,
      paymentMethod,
      ...cardDetails, // Spread the card details to the root level
      description: 'Compra de juegos PS4',
    });
    return response.data;
  },

  getOrders: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/v2/orders', {
      params: { page, limit },
    });
    // response.data.data contiene: { orders, pagination, message }
    return response.data.data || response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/v2/orders/${id}`);
    return response.data;
  },
};

export default orderService;
