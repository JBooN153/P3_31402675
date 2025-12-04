const PaymentStrategy = require('./PaymentStrategy');
const axios = require('axios');

/**
 * CreditCardPaymentStrategy
 * Implementa la estrategia de pago con tarjeta de crédito
 * Integra con la API externa: https://fakepayment.onrender.com/
 */
class CreditCardPaymentStrategy extends PaymentStrategy {
  constructor() {
    super();
    this.apiUrl = process.env.FAKE_PAYMENT_API || 'https://fakepayment.onrender.com';
    this.jwtToken = null;
  }

  /**
   * Obtiene el JWT token requerido por la API de pagos
   * @returns {Promise<string>} Token JWT
   */
  async getPaymentApiToken() {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/api-key`);
      return response.data.apiKey;
    } catch (error) {
      throw new Error(`Failed to get payment API token: ${error.message}`);
    }
  }

  /**
   * Procesa un pago con tarjeta de crédito
   * @param {Object} paymentDetails - { cardNumber, fullName, expirationMonth, expirationYear, cvv, reference }
   * @param {number} amount - Cantidad a pagar
   * @param {string} currency - Moneda (USD, EUR, etc.)
   * @param {string} description - Descripción de la transacción
   * @returns {Promise<Object>} { success, transactionId, message }
   */
  async processPayment(paymentDetails, amount, currency, description) {
    try {
      // Validar campos requeridos
      if (
        !paymentDetails.cardNumber ||
        !paymentDetails.fullName ||
        !paymentDetails.expirationMonth ||
        !paymentDetails.expirationYear ||
        !paymentDetails.cvv
      ) {
        throw new Error('Missing required card details');
      }

      // Obtener token de autorización
      const token = await this.getPaymentApiToken();

      // Preparar datos de la solicitud
      const paymentData = {
        'full-name': paymentDetails.fullName,
        'card-number': paymentDetails.cardNumber,
        'expiration-month': String(paymentDetails.expirationMonth),
        'expiration-year': String(paymentDetails.expirationYear),
        cvv: String(paymentDetails.cvv),
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        description: description,
        reference: paymentDetails.reference || null,
      };

      // Llamar a la API externa de pagos
      const response = await axios.post(`${this.apiUrl}/payments`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 500, // Aceptar cualquier status < 500
      });

      // Manejar redirecciones (la API redirige al detalle de la transacción)
      if (response.status === 302 || response.status === 301) {
        const locationHeader = response.headers.location;
        const transactionId = locationHeader.split('/').pop();

        return {
          success: true,
          transactionId,
          message: 'Payment processed successfully',
        };
      }

      // Si hay error en la respuesta
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment failed');
      }

      // Extraer transaction ID de la respuesta
      const transactionId = response.data.data?.transaction_id || response.data.transaction_id;

      return {
        success: true,
        transactionId,
        message: 'Payment processed successfully',
      };
    } catch (error) {
      // Mensajes específicos según el tipo de error
      let errorMessage = error.message;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Casos de rechazo específicos (basados en el nombre en la tarjeta)
      if (errorMessage.includes('Card rejected')) {
        throw new Error('Card rejected by payment processor');
      }
      if (errorMessage.includes('Card error')) {
        throw new Error('Card processing error');
      }
      if (errorMessage.includes('Insufficient funds')) {
        throw new Error('Insufficient funds on card');
      }

      throw new Error(`Payment processing failed: ${errorMessage}`);
    }
  }
}

module.exports = CreditCardPaymentStrategy;
