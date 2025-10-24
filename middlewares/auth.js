require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que el encabezado exista y tenga formato Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Acceso denegado: Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guarda los datos del token en la solicitud
    next(); // Continúa con la siguiente función
  } catch (error) {
    return res.status(403).json({
      status: 'fail',
      message: 'Token no válido o expirado',
    });
  }
};

module.exports = authenticateJWT;
