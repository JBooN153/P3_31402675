const orderService = require('../services/OrderService');

/**
 * Order Controller
 * Maneja todas las operaciones relacionadas con órdenes
 */
const orderController = {
  /**
   * POST /orders
   * Crear una orden con pago (transacción atómica)
   */
  async create(req, res) {
    try {
      const userId = req.user.id; // Del token JWT
      const { items, paymentMethod, cardNumber, cvv, expirationMonth, expirationYear, fullName, currency, description } = req.body;

      // Validar datos
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Items es requerido y debe ser un array no vacío' 
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'paymentMethod es requerido (ej. CREDIT_CARD)' 
        });
      }

      if (!cardNumber || !cvv || !expirationMonth || !expirationYear || !fullName) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Datos de tarjeta incompletos (cardNumber, cvv, expirationMonth, expirationYear, fullName)' 
        });
      }

      // Crear orden
      const order = await orderService.createOrderWithPayment(userId, items, {
        paymentMethod,
        cardNumber,
        cvv,
        expirationMonth: Number(expirationMonth),
        expirationYear: Number(expirationYear),
        fullName,
        currency: currency || 'USD',
        description: description || 'Compra de productos',
      });

      return res.status(201).json({ 
        status: 'success', 
        data: order,
        message: 'Orden creada exitosamente y pago procesado'
      });
    } catch (error) {
      // Errores esperados
      if (error.message.includes('Stock insuficiente') || 
          error.message.includes('Pago rechazado') ||
          error.message.includes('no encontrado')) {
        return res.status(400).json({ 
          status: 'fail', 
          message: error.message 
        });
      }

      // Error inesperado
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error creando la orden',
        error: error.message 
      });
    }
  },

  /**
   * GET /orders
   * Obtener órdenes del usuario autenticado
   */
  async list(req, res) {
    try {
      const userId = req.user.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (page < 1 || limit < 1 || limit > 50) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'page y limit deben ser números válidos (limit máximo 50)' 
        });
      }

      const result = await orderService.getUserOrders(userId, page, limit);

      return res.status(200).json({ 
        status: 'success', 
        data: {
          items: result.items,
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error obteniendo órdenes',
        error: error.message 
      });
    }
  },

  /**
   * GET /orders/:id
   * Obtener detalle de una orden específica
   */
  async getById(req, res) {
    try {
      const userId = req.user.id;
      const orderId = Number(req.params.id);

      if (Number.isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'ID de orden inválido' 
        });
      }

      const order = await orderService.getOrderById(orderId, userId);

      return res.status(200).json({ 
        status: 'success', 
        data: order
      });
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ 
          status: 'fail', 
          message: error.message 
        });
      }

      return res.status(500).json({ 
        status: 'error', 
        message: 'Error obteniendo la orden',
        error: error.message 
      });
    }
  },
};

module.exports = orderController;
