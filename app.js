// app.js
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { iniciarServer } = require('./config/databaseConfig');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
  iniciarServer();
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}


module.exports = app;
