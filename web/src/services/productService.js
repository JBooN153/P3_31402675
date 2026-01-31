import apiClient from './api';

const productService = {
  getProducts: async (filters = {}) => {
    const response = await apiClient.get('/v2/games', { params: filters });
    // Normalizar posibles formas de payload que puedan venir desde el backend
    // Maneja casos como:
    // - axiosResp.data = { status, data: { items, meta } }
    // - axiosResp.data = { data: { data: { items, meta } } }
    let payload = response.data;
    if (payload && payload.data) payload = payload.data;
    if (payload && payload.data) payload = payload.data;

    const items = Array.isArray(payload?.items) ? payload.items : [];
    const meta = payload?.meta || {};

    return { items, meta };
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/v2/games/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/v2/games', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/v2/games/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/v2/games/${id}`);
    return response.data;
  },
};

export default productService;
