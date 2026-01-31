const app = require('./app'); 
const PORT = process.env.PORT || 3000;

// El servidor se inicia automáticamente desde app.js
// Este archivo es un punto de entrada alternativo si se ejecuta directamente
if (require.main === module) {
  console.log('ℹ️  Nota: El servidor se inicia automáticamente desde app.js');
  console.log(`✅ Servidor disponible en http://localhost:${PORT}`);
}
