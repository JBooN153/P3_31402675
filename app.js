// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { iniciarServer } = require('./config/databaseConfig');
const PaymentApiInitializer = require('./services/PaymentApiInitializer');
const userRoutes = require('./routes/userRoutes');
const userRoutesV2 = require('./routes/userRoutesV2');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:5173'
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Swagger Config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Ejemplo',
      version: '1.0.0',
      description: 'Documentación de la API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
      {
        url: 'https://p3-31402675.onrender.com',
        description: 'Servidor en Render',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js' , './app.js'], // Documentación externa
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas externas
app.use('/', userRoutes);
app.use('/v2', userRoutesV2);

// Rutas externas adicionales
/**
 * @swagger
 * /about:
 *   get:
 *     summary: Obtener información del usuario
 *     responses:
 *       200:
 *         description: Información del usuario en formato JSend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombreCompleto:
 *                       type: string
 *                     cedula:
 *                       type: string
 *                     seccion:
 *                       type: string
 */
app.get('/about', (req, res) => {
  res.json({
    status: "success",
    data: {
      nombreCompleto: "Jose Gregorio Sanchez Seijas",
      cedula: "V31402675",
      seccion: "2"
    }
  });
});

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Verificar si el servidor está en funcionamiento
 *     responses:
 *       200:
 *         description: Respuesta OK
 */
app.get('/ping', (req, res) => {
  res.sendStatus(200);
});

// Iniciar servidor si no es test
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      // Inicializar configuración de pagos
      await PaymentApiInitializer.inicializar();
      console.log('✅ PaymentAPI inicializado');
      
      // Iniciar base de datos
      await iniciarServer();
      
      // Escuchar en el puerto
      const server = app.listen(port, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${port}`);
      });
      
      // Mantener el servidor vivo
      server.on('error', (err) => {
        console.error('❌ Error del servidor:', err);
        process.exit(1);
      });
      
      // Manejar shutdown graceful
      process.on('SIGINT', () => {
        console.log('\n⛔ Cerrando servidor...');
        server.close(() => {
          console.log('✅ Servidor cerrado');
          process.exit(0);
        });
      });
    } catch (err) {
      console.error('❌ Error al iniciar el servidor:', err);
      process.exit(1);
    }
  })();
}


module.exports = app;
