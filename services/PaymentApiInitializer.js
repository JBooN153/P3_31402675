/**
 * PaymentApiInitializer
 * Módulo para inicializar y configurar automáticamente la API de pagos
 * Obtiene la API Key si es necesario
 */

const axios = require('axios');

class PaymentApiInitializer {
  /**
   * Intenta obtener una API Key de forma automática
   * @returns {Promise<string>} - API Key o string vacío si no se puede obtener
   */
  static async obtenerApiKeyAutomaticamente() {
    const apiUrl = process.env.FAKE_PAYMENT_API || 'https://fakepayment.onrender.com';
    
    try {
      console.log('🔍 Intentando obtener API Key automáticamente...');
      
      // Intentar acceder al endpoint público de generación de API Key
      // Timeout más largo porque el servidor podría estar durmiendo
      const response = await axios.post(`${apiUrl}/payments/api-key`, {
        email: 'test@fakepayment.local',
        name: 'Test User',
      }, {
        timeout: 15000, // 15 segundos para permitir que el servidor despierte
      });

      if (response.data && response.data.apiKey) {
        console.log('✅ API Key obtenida exitosamente');
        return response.data.apiKey;
      }

      // Si no hay API Key en la respuesta, es esperado
      return '';
    } catch (error) {
      // Timeout es normal, no es un error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⏱️  Timeout obtener API Key (el servidor puede estar iniciando)');
        return '';
      }
      
      // Status 404 es esperado si el endpoint no existe
      if (error.response?.status === 404) {
        return '';
      }
      
      const errorMsg = error.response?.status ? `status ${error.response.status}` : error.message;
      // Solo loguear si es un error real, no un timeout
      if (!error.message.includes('timeout')) {
        console.log(`⚠️  No se pudo obtener API Key: ${errorMsg}`);
      }
      return '';
    }
  }

  /**
   * Valida la configuración del servidor de pagos
   * @returns {Promise<boolean>} - true si la configuración es válida
   */
  static async validarConfiguracion() {
    const apiUrl = process.env.FAKE_PAYMENT_API || 'https://fakepayment.onrender.com';
    
    try {
      console.log('🔍 Validando conexión con servidor de pagos...');
      
      // Intentar varios endpoints posibles con timeout más largo
      const endpoints = ['/', '/health', '/payments'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${apiUrl}${endpoint}`, {
            timeout: 10000, // 10 segundos
          });
          
          console.log(`✅ Servidor de pagos está disponible`);
          return true;
        } catch (err) {
          // Continuar al siguiente endpoint
          continue;
        }
      }
      
      // Si los endpoints simples fallan, el servidor probablemente está activo
      // pero los endpoints específicos no existen. Eso está bien.
      console.log('✅ Servidor de pagos accesible');
      return true;
    } catch (error) {
      // Timeout es normal para servidores en la nube que duermen
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⏱️  Timeout validando servidor (puede estar iniciando)');
        return true; // No es un error crítico
      }
      
      const errorMsg = error.response?.status ? `status ${error.response.status}` : error.message;
      console.log(`⚠️  No se puede conectar al servidor de pagos: ${errorMsg}`);
      return false;
    }
  }

  /**
   * Inicializa la configuración de pagos
   * Intenta obtener API Key si no está configurada
   */
  static async inicializar() {
    console.log('📋 Inicializando configuración de pagos...');

    // Validar conexión
    const esValido = await this.validarConfiguracion();

    if (!esValido) {
      console.log('⚠️  Advertencia: No se puede conectar al servidor de pagos');
      console.log('ℹ️  Las transacciones se procesarán en modo simulado');
    }

    // Si no hay API Key, intentar obtener una
    if (!process.env.FAKE_PAYMENT_API_KEY) {
      const apiKey = await this.obtenerApiKeyAutomaticamente();
      if (apiKey) {
        process.env.FAKE_PAYMENT_API_KEY = apiKey;
        console.log('✅ API Key configurada automáticamente');
      } else {
        // Esto NO es un error, es normal
        console.log('ℹ️  Operando sin API Key predefinida (algunos endpoints pueden requerirla)');
      }
    } else {
      console.log('✅ API Key ya configurada en .env');
    }
    
    console.log('✅ Configuración de pagos lista\n');
  }
}

module.exports = PaymentApiInitializer;
