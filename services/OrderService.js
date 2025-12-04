const { AppDataSource } = require('../config/databaseConfig');
const CreditCardPaymentStrategy = require('./CreditCardPaymentStrategy');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Game = require('../models/Product');
const Usuario = require('../models/usuario');

/**
 * OrderService
 * Fachada que orquesta todo el proceso de compra (Patrón Facade)
 * Maneja:
 * - Validación de stock
 * - Cálculo de totales
 * - Procesamiento de pagos (usando Strategy Pattern)
 * - Transacciones de base de datos (atómicas)
 * - Actualización de stock
 * - Creación de órdenes
 */
class OrderService {
  constructor() {
    this.orderRepo = AppDataSource.getRepository(Order);
    this.orderItemRepo = AppDataSource.getRepository(OrderItem);
    this.productRepo = AppDataSource.getRepository(Game);
    this.userRepo = AppDataSource.getRepository(Usuario);
  }

  /**
   * Crea una orden completa con pago (transacción atómica)
   * @param {number} userId - ID del usuario comprador
   * @param {Array} items - Items a comprar [{productId, quantity}, ...]
   * @param {Object} paymentData - Datos del pago {paymentMethod, amount, currency, ...}
   * @returns {Promise<Object>} - Orden creada
   */
  async createOrderWithPayment(userId, items, paymentData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener usuario
      const user = await queryRunner.manager.findOne(Usuario, { where: { id: userId } });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 2. Validar stock y construir OrderItems
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await queryRunner.manager.findOne(Game, { 
          where: { id: item.productId } 
        });

        if (!product) {
          throw new Error(`Producto ${item.productId} no encontrado`);
        }

        // Verificar stock suficiente
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          product,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      // 3. Procesar pago
      const paymentStrategy = this.getPaymentStrategy(paymentData.paymentMethod);
      const paymentResult = await paymentStrategy.processPayment(
        {
          cardNumber: paymentData.cardNumber,
          fullName: paymentData.fullName,
          expirationMonth: paymentData.expirationMonth,
          expirationYear: paymentData.expirationYear,
          cvv: paymentData.cvv,
          reference: `ORD-${userId}-${Date.now()}`,
        },
        Math.round(totalAmount * 100) / 100, // Redondear a 2 decimales
        paymentData.currency || 'USD',
        paymentData.description || 'Purchase'
      );

      if (!paymentResult.success) {
        throw new Error(`Pago rechazado: ${paymentResult.message}`);
      }

      // 4. Actualizar stock (solo después de pago exitoso)
      for (const item of items) {
        const product = await queryRunner.manager.findOne(Game, { 
          where: { id: item.productId } 
        });
        product.stock -= item.quantity;
        await queryRunner.manager.save(Game, product);
      }

      // 5. Crear la Order
      const order = queryRunner.manager.create(Order, {
        user,
        status: 'COMPLETED',
        totalAmount,
        currency: paymentData.currency || 'USD',
        transactionId: paymentResult.transactionId,
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description || 'Purchase',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 6. Crear OrderItems
      for (const itemData of orderItemsData) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: itemData.product,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          subtotal: itemData.subtotal,
        });
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      // Commit de la transacción
      await queryRunner.commitTransaction();

      // Retornar orden con items
      return await this.orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: ['user', 'items', 'items.product'],
      });
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene órdenes del usuario con paginación
   * @param {number} userId - ID del usuario
   * @param {number} page - Número de página
   * @param {number} limit - Elementos por página
   * @returns {Promise<Object>} - {items, total, page, limit, totalPages}
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [items, total] = await this.orderRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene una orden específica del usuario
   * @param {number} orderId - ID de la orden
   * @param {number} userId - ID del usuario (para validar que le pertenece)
   * @returns {Promise<Object>} - Orden con detalles
   */
  async getOrderById(orderId, userId) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new Error('Orden no encontrada o no pertenece al usuario');
    }

    return order;
  }

  /**
   * Selecciona la estrategia de pago basada en el tipo
   * @param {string} paymentMethod - Tipo de pago (CREDIT_CARD, ...)
   * @returns {PaymentStrategy} - Instancia de la estrategia de pago
   */
  getPaymentStrategy(paymentMethod = 'CREDIT_CARD') {
    // Validar que paymentMethod no sea undefined
    if (!paymentMethod) {
      throw new Error('Método de pago no especificado');
    }
    
    switch (String(paymentMethod).toUpperCase()) {
      case 'CREDIT_CARD':
        return new CreditCardPaymentStrategy();
      // Futuras estrategias: PAYPAL, CRYPTO, etc.
      default:
        throw new Error(`Método de pago no soportado: ${paymentMethod}`);
    }
  }
}

module.exports = new OrderService();
