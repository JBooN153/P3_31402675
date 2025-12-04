const { EntitySchema } = require('typeorm');

/**
 * OrderItem Model
 * Tabla intermedia para la relación Muchos-a-Muchos entre Order y Product
 * Registra qué productos fueron comprados en qué cantidad y a qué precio
 */
module.exports = new EntitySchema({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    // Cantidad del producto en esta orden
    quantity: {
      type: 'int',
      nullable: false,
      default: 1,
    },
    // Precio unitario del producto AL MOMENTO de la compra (precio histórico)
    unitPrice: {
      type: 'float',
      nullable: false,
      default: 0,
    },
    // Subtotal de este item (quantity * unitPrice)
    subtotal: {
      type: 'float',
      nullable: false,
      default: 0,
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
    // Relación con Order
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: true,
      nullable: false,
    },
    // Relación con Product
    product: {
      type: 'many-to-one',
      target: 'Game',
      joinColumn: true,
      nullable: false,
      eager: true,
    },
  },
});
