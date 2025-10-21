const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentación de la API para el servidor Express',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./app.js'], // Ruta de los archivos que contienen la documentación JSDoc
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

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
    const response = {
        status: "success",
        data: {
            nombreCompleto: "Jose Gregorio Sanchez Seijas",
            cedula: "V31402675",
            seccion: "2"
        }
    };
    res.json(response);
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

const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = server;


