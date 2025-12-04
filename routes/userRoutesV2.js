const express = require('express');
const authenticateJWT = require('../middlewares/auth');
const { getAll: getAllCategories, create: createCategory, update: updateCategory, delete: deleteCategory } = require('../controllers/Category');
const { getAll: getAllTags, create: createTag, update: updateTag, delete: deleteTag } = require('../controllers/Tag');
const { list: listProducts, publicView, getById, create, update, delete: deleteProduct } = require('../controllers/Product');
const { create: createOrder, list: listOrders, getById: getOrderById } = require('../controllers/Order');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Action"
 *         description:
 *           type: string
 *           example: "Action games category"
 *     TagCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Adventure"
 *     GameCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "God of War"
 *         developer:
 *           type: string
 *           example: "Santa Monica Studio"
 *         publisher:
 *           type: string
 *           example: "Sony Interactive Entertainment"
 *         releaseDate:
 *           type: string
 *           format: date
 *           example: "2018-04-20"
 *         price:
 *           type: number
 *           format: float
 *           example: 59.99
 *         stock:
 *           type: integer
 *           example: 10
 *         genre:
 *           type: string
 *           example: "Action-Adventure"
 *         platform:
 *           type: string
 *           example: "PS4"
 *         esrb:
 *           type: string
 *           example: "M"
 *         sku:
 *           type: string
 *           example: "GOW-PS4-001"
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           description: ID of the category to associate
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *           description: List of tag IDs to associate
 *
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "Action"
 *         description:
 *           type: string
 *           example: "Category for action games"
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "Adventure"
 *     Game:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "God of War"
 *         developer:
 *           type: string
 *           example: "Santa Monica Studio"
 *         publisher:
 *           type: string
 *           example: "Sony Interactive Entertainment"
 *         releaseDate:
 *           type: string
 *           format: date
 *           example: "2018-04-20"
 *         price:
 *           type: number
 *           format: float
 *           example: 59.99
 *         stock:
 *           type: integer
 *           example: 10
 *         genre:
 *           type: string
 *           example: "Action-Adventure"
 *         platform:
 *           type: string
 *           example: "PS4"
 *         esrb:
 *           type: string
 *           example: "M"
 *         sku:
 *           type: string
 *           example: "GOW-PS4-001"
 *         categoryId:
 *           type: integer
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *         slug:
 *           type: string
 *           example: "god-of-war-ps4"
 *
 *     OrderCreate:
 *       type: object
 *       required:
 *         - items
 *         - paymentMethod
 *         - cardNumber
 *         - cvv
 *         - expirationMonth
 *         - expirationYear
 *         - fullName
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *                 description: "ID del producto a comprar"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *                 description: "Cantidad de unidades"
 *           description: "Array de items a comprar (mínimo 1)"
 *         paymentMethod:
 *           type: string
 *           example: "CREDIT_CARD"
 *           description: "Método de pago (actualmente solo CREDIT_CARD)"
 *         cardNumber:
 *           type: string
 *           example: "4111111111111111"
 *           description: "Número de tarjeta (16 dígitos)"
 *         cvv:
 *           type: string
 *           example: "123"
 *           description: "Código de verificación (3-4 dígitos)"
 *         expirationMonth:
 *           type: integer
 *           example: 12
 *           minimum: 1
 *           maximum: 12
 *           description: "Mes de vencimiento"
 *         expirationYear:
 *           type: integer
 *           example: 2025
 *           description: "Año de vencimiento (4 dígitos)"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *           description: "Nombre titular de la tarjeta"
 *         currency:
 *           type: string
 *           example: "USD"
 *           default: "USD"
 *           description: "Moneda de la transacción"
 *         description:
 *           type: string
 *           example: "Compra de juegos PS4"
 *           description: "Descripción de la orden"
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         product:
 *           $ref: '#/components/schemas/Game'
 *         quantity:
 *           type: integer
 *           example: 2
 *           description: "Cantidad de unidades en la orden"
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 59.99
 *           description: "Precio unitario al momento de la compra (para auditoría histórica)"
 *         subtotal:
 *           type: number
 *           format: float
 *           example: 119.98
 *           description: "Subtotal = quantity * unitPrice"
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELED, PAYMENT_FAILED]
 *           example: "COMPLETED"
 *           description: "Estado de la orden"
 *         totalAmount:
 *           type: number
 *           format: float
 *           example: 119.98
 *           description: "Monto total de la orden"
 *         currency:
 *           type: string
 *           example: "USD"
 *           description: "Moneda de la transacción"
 *         transactionId:
 *           type: string
 *           example: "txn_abc123"
 *           nullable: true
 *           description: "ID de la transacción en el proveedor de pagos"
 *         paymentMethod:
 *           type: string
 *           example: "CREDIT_CARD"
 *           description: "Método de pago utilizado"
 *         description:
 *           type: string
 *           example: "Compra de juegos PS4"
 *           description: "Descripción de la orden"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: "Items comprados en la orden"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *           example: "2025-12-04T20:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *           example: "2025-12-04T20:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   - name: "Public - Games"
 *     description: "Public endpoints to list and view games"
 *   - name: "Admin - Games"
 *     description: "Protected endpoints to manage games"
 *   - name: "Admin - Categories"
 *     description: "Protected endpoints to manage categories"
 *   - name: "Admin - Tags"
 *     description: "Protected endpoints to manage tags"
 *   - name: "Admin - Orders"
 *     description: "Protected endpoints for orders and payments (transactional operations)"
 */

/**
 * @swagger
 * /v2/p/{composite}:
 *   get:
 *     summary: Vista pública de un juego por id y slug (self-healing)
 *     tags: ["Public - Games"]
 *     parameters:
 *       - in: path
 *         name: composite
 *         schema:
 *           type: string
 *         required: true
 *         description: Formato id-slug, por ejemplo 1-god-of-war-ps4. La ruta validará el id y comparará el slug almacenado; si el slug no coincide, devuelve una redirección 301 a la URL canónica.
 *     responses:
 *       200:
 *         description: Juego encontrado y retornado en formato JSend
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "God of War"
 *                 developer: "Santa Monica Studio"
 *                 price: 59.99
 *                 platform: "PS4"
 *                 slug: "god-of-war-ps4"
 *       301:
 *         description: Redirección a la URL canónica cuando el slug no coincide
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Moved Permanently"
 *               redirect: "/v2/p/1-god-of-war-ps4"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid product id"
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Product not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

/**
 * @swagger
 * /v2/games:
 *   get:
 *     summary: Lista pública de juegos (paginación y filtros)
 *     tags: ["Public - Games"]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página (para paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por id o nombre de categoría
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Lista de ids de tags separados por comas
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (name o description)
 *       - in: query
 *         name: developer
 *         schema:
 *           type: string
 *         description: Filtrar por desarrollador
 *       - in: query
 *         name: publisher
 *         schema:
 *           type: string
 *         description: Filtrar por editor/publisher
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filtrar por plataforma (ej. PS4)
 *       - in: query
 *         name: esrb
 *         schema:
 *           type: string
 *         description: Filtrar por clasificación ESRB
 *     responses:
 *       200:
 *         description: Lista paginada de juegos
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 items:
 *                   - id: 1
 *                     name: "God of War"
 *                     developer: "Santa Monica Studio"
 *                     price: 59.99
 *                     platform: "PS4"
 *                     slug: "god-of-war-ps4"
 *                 meta:
 *                   total: 42
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 5
 *       400:
 *         description: Petición inválida (parámetros de consulta incorrectos)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid query parameters"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
router.get('/games', listProducts);

/**
 * @swagger
 * /v2/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 - id: 1
 *                   name: "Action"
 *                   description: "Action games"
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 10
 *                 name: "New Category"
 *                 description: "Created by CI"
 *
 */
// Category routes (protected)
router.get('/categories', authenticateJWT, getAllCategories);
router.post('/categories', authenticateJWT, require('../middlewares/validators').categoryCreate, createCategory);
router.put('/categories/:id', authenticateJWT, require('../middlewares/validators').categoryUpdate, updateCategory);
router.delete('/categories/:id', authenticateJWT, deleteCategory);

/**
 * @swagger
 * /v2/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría por ID
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Action Updated"
 *                 description: "Updated description"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category not found"
 *       409:
 *         description: Nombre duplicado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category name already in use"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar categoría por ID
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Category deleted"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category not found"
 *       409:
 *         description: No se puede eliminar por integridad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category has related products and cannot be deleted"
 */



/**
 * @swagger
 * /v2/tags:
 *   get:
 *     summary: Obtener todas las etiquetas
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de etiquetas
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 - id: 1
 *                   name: "Adventure"
 *   post:
 *     summary: Crear una nueva etiqueta
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *     responses:
 *       201:
 *         description: Etiqueta creada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 5
 *                 name: "NewTag"
 *
 */
// Tag routes (protected)
router.get('/tags', authenticateJWT, getAllTags);
router.post('/tags', authenticateJWT, require('../middlewares/validators').tagCreate, createTag);
router.put('/tags/:id', authenticateJWT, require('../middlewares/validators').tagUpdate, updateTag);
router.delete('/tags/:id', authenticateJWT, deleteTag);

/**
 * @swagger
 * /v2/tags/{id}:
 *   put:
 *     summary: Actualizar una etiqueta por ID
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *     responses:
 *       200:
 *         description: Etiqueta actualizada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 2
 *                 name: "Adventure Updated"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       404:
 *         description: Etiqueta no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag not found"
 *       409:
 *         description: Nombre duplicado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag name already in use"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar una etiqueta por ID
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Etiqueta eliminada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Tag deleted"
 *       404:
 *         description: Etiqueta no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag not found"
 *       409:
 *         description: No se puede eliminar por integridad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag has related products and cannot be deleted"
 */



/**
 * @swagger
 * /v2/games:
 *   post:
 *     summary: Crear un nuevo juego (protegido)
 *     tags: ["Admin - Games"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCreate'
 *     responses:
 *       201:
 *         description: Juego creado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 101
 *                 name: "Sample Game"
 *                 slug: "sample-game"
 *       400:
 *         description: Petición inválida (datos faltantes o formato incorrecto)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Field 'name' is required"
 *       409:
 *         description: Conflicto - el slug o juego ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Conflicto: duplicado o violación de restricción"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 * /v2/games/{id}:
 *   get:
 *     summary: Obtener un juego por ID (protegido)
 *     tags: ["Admin - Games"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Juego encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "God of War"
 *                 developer: "Santa Monica Studio"
 *                 price: 59.99
 *                 slug: "god-of-war-ps4"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid product id"
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Product not found"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   put:
 *     summary: Actualizar un juego por ID (protegido)
 *     tags: ["Admin - Games"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameCreate'
 *     responses:
 *       200:
 *         description: Juego actualizado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "God of War - Updated"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Product not found"
 *       409:
 *         description: Conflicto - el slug ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Conflict: slug already exists"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar un juego por ID (protegido)
 *     tags: ["Admin - Games"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Juego eliminado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Product deleted"
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Product not found"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
// Game management routes (protected)
router.post('/games', authenticateJWT, require('../middlewares/validators').gameCreate, create);
router.get('/games/:id', authenticateJWT, getById);
router.put('/games/:id', authenticateJWT, require('../middlewares/validators').gameUpdate, update);
router.delete('/games/:id', authenticateJWT, deleteProduct);


router.get('/p/:composite', publicView);

/**
 * @swagger
 * /v2/orders:
 *   post:
 *     summary: "Crear una orden con pago (OPERACIÓN TRANSACCIONAL ATÓMICA)"
 *     description: |
 *       Crea una orden completa con procesamiento de pago integrado.
 *       **IMPORTANTE: Esta es una operación transaccional que es ATÓMICA (todo o nada):**
 *       
 *       **Flujo de la transacción:**
 *       1. Validar stock disponible para todos los items
 *       2. Calcular monto total de la orden
 *       3. Procesar el pago mediante la tarjeta de crédito
 *       4. Si el pago es exitoso:
 *          - Reducir stock de cada producto
 *          - Crear registro de Order
 *          - Crear registros de OrderItem (con precio histórico)
 *          - COMMIT de transacción
 *       5. Si algún paso falla:
 *          - ROLLBACK completo: stock NO es modificado, orden NO es creada
 *       
 *       **Garantías:**
 *       - Si recibe 201, la orden fue creada exitosamente Y el pago fue procesado AND stock fue reducido
 *       - Si recibe 400, nada fue modificado (completo rollback)
 *       - Cada OrderItem preserva el unitPrice al momento de la compra (auditoría histórica)
 *       
 *       **Métodos de pago soportados:**
 *       - CREDIT_CARD: Tarjeta de crédito integrada con https://fakepayment.onrender.com
 *     tags: ["Admin - Orders"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreate'
 *           examples:
 *             successful:
 *               summary: "Ejemplo de orden exitosa"
 *               value:
 *                 items:
 *                   - productId: 1
 *                     quantity: 2
 *                   - productId: 3
 *                     quantity: 1
 *                 paymentMethod: "CREDIT_CARD"
 *                 cardNumber: "4111111111111111"
 *                 cvv: "123"
 *                 expirationMonth: 12
 *                 expirationYear: 2025
 *                 fullName: "John Doe"
 *                 currency: "USD"
 *                 description: "Compra de juegos PS4"
 *     responses:
 *       201:
 *         description: "✅ Orden creada exitosamente Y pago procesado Y stock actualizado"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Orden creada exitosamente y pago procesado"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: |
 *           ❌ Validación fallida O stock insuficiente O pago rechazado.
 *           **Garantizado: Transacción hizo ROLLBACK - stock NO fue modificado, orden NO fue creada**
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *               examples:
 *                 insufficientStock:
 *                   summary: "Stock insuficiente"
 *                   value:
 *                     status: fail
 *                     message: "Stock insuficiente para God of War. Disponible: 5, Solicitado: 10"
 *                 paymentRejected:
 *                   summary: "Pago rechazado"
 *                   value:
 *                     status: fail
 *                     message: "Pago rechazado: Fondos insuficientes"
 *                 invalidItems:
 *                   summary: "Items inválidos"
 *                   value:
 *                     status: fail
 *                     message: "Items es requerido y debe ser un array no vacío"
 *       401:
 *         description: "❌ No autorizado - Token JWT inválido o ausente"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *             examples:
 *               noToken:
 *                 summary: "Token ausente"
 *                 value:
 *                   status: fail
 *                   message: "No token provided"
 *               invalidToken:
 *                 summary: "Token inválido"
 *                 value:
 *                   status: fail
 *                   message: "Invalid token"
 *               expiredToken:
 *                 summary: "Token expirado"
 *                 value:
 *                   status: fail
 *                   message: "Token expired"
 *       500:
 *         description: "❌ Error interno del servidor"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             examples:
 *               paymentApiError:
 *                 summary: "Error comunicándose con API de pagos"
 *                 value:
 *                   status: error
 *                   message: "Error creando la orden"
 *                   error: "Error comunicándose con el servidor de pagos"
 *               databaseError:
 *                 summary: "Error de base de datos"
 *                 value:
 *                   status: error
 *                   message: "Error creando la orden"
 *                   error: "Database connection failed"
 *               timeoutError:
 *                 summary: "Timeout en API de pagos"
 *                 value:
 *                   status: error
 *                   message: "Error creando la orden"
 *                   error: "Payment API timeout after 15000ms"
 *   get:
 *     summary: "Obtener órdenes del usuario autenticado (con paginación)"
 *     tags: ["Admin - Orders"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número de página (comienza en 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: "Elementos por página (máximo 50)"
 *     responses:
 *       200:
 *         description: "Lista de órdenes del usuario autenticado"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *             examples:
 *               success:
 *                 summary: "Órdenes encontradas"
 *                 value:
 *                   status: success
 *                   data:
 *                     items:
 *                       - id: 1
 *                         status: COMPLETED
 *                         totalAmount: 119.98
 *                         currency: USD
 *                         createdAt: "2025-12-04T20:30:00Z"
 *                       - id: 2
 *                         status: COMPLETED
 *                         totalAmount: 59.99
 *                         currency: USD
 *                         createdAt: "2025-12-04T19:45:00Z"
 *                     meta:
 *                       total: 2
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 1
 *               empty:
 *                 summary: "Sin órdenes"
 *                 value:
 *                   status: success
 *                   data:
 *                     items: []
 *                     meta:
 *                       total: 0
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 0
 *       401:
 *         description: "❌ No autorizado - Token JWT inválido o ausente"
 *         content:
 *           application/json:
 *             examples:
 *               noToken:
 *                 summary: "Token ausente"
 *                 value:
 *                   status: fail
 *                   message: "No token provided"
 *               invalidToken:
 *                 summary: "Token inválido"
 *                 value:
 *                   status: fail
 *                   message: "Invalid token"
 *       500:
 *         description: "❌ Error interno del servidor"
 *         content:
 *           application/json:
 *             examples:
 *               databaseError:
 *                 summary: "Error de base de datos"
 *                 value:
 *                   status: error
 *                   message: "Error obteniendo órdenes"
 *                   error: "Database connection failed"
 * /v2/orders/{id}:
 *   get:
 *     summary: "Obtener detalle de una orden específica"
 *     description: |
 *       Recupera los detalles completos de una orden incluyendo:
 *       - Información del usuario comprador
 *       - Estado de la orden (PENDING, COMPLETED, CANCELED, PAYMENT_FAILED)
 *       - Detalles de cada item con precio histórico (unitPrice)
 *       - Información de la transacción de pago (transactionId)
 *       - Timestamps de creación y actualización
 *       
 *       **Seguridad:** El usuario autenticado solo puede ver sus propias órdenes
 *     tags: ["Admin - Orders"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: "ID de la orden"
 *     responses:
 *       200:
 *         description: "Detalle completo de la orden"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: "❌ ID de orden inválido (no es un número)"
 *         content:
 *           application/json:
 *             examples:
 *               invalidId:
 *                 summary: "ID no es número"
 *                 value:
 *                   status: fail
 *                   message: "Invalid product id"
 *       404:
 *         description: "❌ Orden no encontrada"
 *         content:
 *           application/json:
 *             examples:
 *               notFound:
 *                 summary: "Orden no existe"
 *                 value:
 *                   status: fail
 *                   message: "Order not found"
 *       401:
 *         description: "❌ No autorizado - Token JWT inválido o ausente"
 *         content:
 *           application/json:
 *             examples:
 *               noToken:
 *                 summary: "Token ausente"
 *                 value:
 *                   status: fail
 *                   message: "No token provided"
 *               invalidToken:
 *                 summary: "Token inválido"
 *                 value:
 *                   status: fail
 *                   message: "Invalid token"
 */
// Order routes (protected)
router.post('/orders', authenticateJWT, createOrder);
router.get('/orders', authenticateJWT, listOrders);
router.get('/orders/:id', authenticateJWT, getOrderById);

module.exports = router;
