/**
 * PaymentStrategy
 * Interfaz base para las estrategias de pago
 * Define el contrato que todas las estrategias deben cumplir
 */
class PaymentStrategy {
  /**
   * Procesa un pago
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del pago {success, transactionId, message}
   */
  async processPayment(paymentData) {
    throw new Error('processPayment() debe ser implementado por la estrategia concreta');
  }

  /**
   * Obtiene el estado de una transacción
   * @param {string} transactionId - ID de la transacción
   * @returns {Promise<Object>} - Datos de la transacción
   */
  async getTransactionStatus(transactionId) {
    throw new Error('getTransactionStatus() debe ser implementado por la estrategia concreta');
  }
}

module.exports = PaymentStrategy;
