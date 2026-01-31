const { EntitySchema } = require('typeorm');

/**
 * Order Model
 * Representa una orden de compra de un usuario
 */
module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    // Estado de la orden
    status: {
      type: String,
      nullable: false,
      default: 'PENDING',
      // Estados posibles: PENDING, COMPLETED, CANCELED, PAYMENT_FAILED
    },
    // Monto total de la orden
    totalAmount: {
      type: 'float',
      nullable: false,
      default: 0,
    },
    // Moneda utilizada (USD, EUR, VES)
    currency: {
      type: String,
      nullable: false,
      default: 'USD',
    },
    // ID de transacción en el proveedor externo
    transactionId: {
      type: String,
      nullable: true,
    },
    // Método de pago utilizado
    paymentMethod: {
      type: String,
      nullable: false,
      default: 'CREDIT_CARD',
    },
    // Descripción o notas de la orden
    description: {
      type: 'text',
      nullable: true,
    },
    // Timestamps
    createdAt: {
      type: 'datetime',
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
      nullable: false,
    },
  },
  relations: {
    // Relación con User (comprador)
    user: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: true,
      nullable: false,
      eager: true,
    },
    // Relación con OrderItems
    items: {
      type: 'one-to-many',
      target: 'OrderItem',
      inverseSide: 'order',
      eager: true,
      cascade: true,
    },
  },
});
