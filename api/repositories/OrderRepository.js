const { AppDataSource } = require('../config/databaseConfig');

/**
 * OrderRepository
 * Maneja todas las operaciones de lectura/escritura de Orders
 */
class OrderRepository {
  constructor() {
    this.repo = AppDataSource.getRepository('Order');
    this.itemRepo = AppDataSource.getRepository('OrderItem');
  }

  /**
   * Obtiene una orden por ID con todas sus relaciones
   */
  async findByIdWithRelations(orderId) {
    return await this.repo.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product'],
    });
  }

  /**
   * Obtiene órdenes de un usuario específico
   */
  async findByUserId(userId, skip = 0, take = 10) {
    return await this.repo.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Crea una nueva orden
   */
  async create(orderData) {
    const order = this.repo.create(orderData);
    return await this.repo.save(order);
  }

  /**
   * Guarda una orden
   */
  async save(order) {
    return await this.repo.save(order);
  }

  /**
   * Obtiene todas las órdenes con estado específico
   */
  async findByStatus(status) {
    return await this.repo.find({
      where: { status },
      relations: ['user', 'items', 'items.product'],
    });
  }

  /**
   * Obtiene una orden por ID de transacción
   */
  async findByTransactionId(transactionId) {
    return await this.repo.findOne({
      where: { transactionId },
      relations: ['user', 'items', 'items.product'],
    });
  }

  /**
   * Elimina una orden (soft delete - solo cambiar estado)
   */
  async cancel(orderId) {
    const order = await this.repo.findOne({ where: { id: orderId } });
    if (order && order.status === 'PENDING') {
      order.status = 'CANCELED';
      return await this.repo.save(order);
    }
    throw new Error('No se puede cancelar una orden que no está PENDING');
  }
}

module.exports = new OrderRepository();
