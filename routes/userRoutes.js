const { getAllUsers, getUserById } = require('../controllers/UserGet')
const { createUser, updateUser } = require('../controllers/UserPostPut')
const { deleteUser } = require('../controllers/UserDelete')
const { loginUser, registerUser } = require('../controllers/Access')
const authenticateJWT = require('../middlewares/auth')

const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema.
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario.
 *                 example: "hector sanchez"
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: "hector.sanchez@example.com"
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario.
 *                 example: "contraseñaejemplo!"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "hector sanchez"
 *                     email:
 *                       type: string
 *                       example: "hector.sanchez@example.com"
 *       400:
 *         description: Solicitud incorrecta, falta algún campo o el formato del correo es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Todos los campos son obligatorios"
 *       409:
 *         description: Conflicto, el correo electrónico ya está en uso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "El correo ya está en uso"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error al registrar el usuario"
 *                 error:
 *                   type: string
 *                   example: "Error específico aquí"
 */
router.post('/auth/register', registerUser)


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión con un usuario existente
 *     description: Permite a un usuario iniciar sesión utilizando su email y contraseña.
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - contrasena
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: "hector.sanchez@example.com"
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario.
 *                 example: "ContraseñaSegura123!"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                   description: Token JWT para la sesión del usuario.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       400:
 *         description: Solicitud incorrecta, falta email o contraseña o tienen formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "El campo email es obligatorio y no puede estar vacío."
 *       401:
 *         description: Credenciales inválidas, el usuario no existe o la contraseña no coincide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas."
 *       500:
 *         description: Error interno del servidor durante el inicio de sesión.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error al iniciar sesión."
 */
router.post('/auth/login', loginUser)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios
 *     description: Recupera todos los usuarios de la base de datos.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []  # Indica que se requiere autenticación
 *     responses:
 *       200:
 *         description: Lista de usuarios recuperada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuarios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             example: "hector sanchez"
 *                           email:
 *                             type: string
 *                             example: "hector.sanchez@example.com"
 *       401:
 *         description: No autorizado, el token JWT es inválido o no se proporciona.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No autorizado."
 *       500:
 *         description: Error interno del servidor durante la recuperación de usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error al obtener los usuarios"
 */
router.get('/users',authenticateJWT, getAllUsers)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     description: Recupera los detalles de un usuario específico de la base de datos utilizando su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []  # Asegúrate de que esto esté presente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a recuperar.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuario recuperado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nombre:
 *                           type: string
 *                           example: "hector sanchez"
 *                         email:
 *                           type: string
 *                           example: "hector.sanchez@example.com"
 *       400:
 *         description: ID de usuario no válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "ID de usuario no válido"
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/users/:id',authenticateJWT, getUserById)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     description: Permite la creación de un nuevo usuario en el sistema, requiere autenticación.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []  # Asegúrate de que esto esté presente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario.
 *                 example: "hector sanchez"
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: "hector.sanchez@example.com"
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario.
 *                 example: "ContraseñaSegura123!"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nombre:
 *                           type: string
 *                           example: "hector sanchez"
 *                         email:
 *                           type: string
 *                           example: "hector.sanchez@example.com"
 *       400:
 *         description: Solicitud incorrecta, falta algún campo o el formato del correo es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Todos los campos son obligatorios"
 *       409:
 *         description: Conflicto, el correo electrónico ya está en uso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "El correo ya está en uso"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error al crear el usuario"
 */
router.post('/users',authenticateJWT, createUser)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar información de usuario
 *     description: Permite actualizar la información de un usuario existente
 *     security:
 *       - bearerAuth: []  # Asegúrate de que esto esté presente
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: hector
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: hector.sanchez@example.com
 *               contrasena:
 *                 type: string
 *                 description: Nueva contraseña del usuario (opcional)
 *                 example: NuevaContraseña123
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: hector
 *                     email:
 *                       type: string
 *                       example: hector.sanchez@example.com
 *       400:
 *         description: Error de validación
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
 *                   example: El campo 'nombre' no puede estar vacío
 *       401:
 *         description: No autorizado, token JWT inválido
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
 *                   example: No autorizado
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: Usuario no encontrado
 *       409:
 *         description: Conflicto (por ejemplo, correo electrónico ya existente)
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
 *                   example: El correo ya está en uso
 *       500:
 *         description: Error interno del servidor
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
 *                   example: Error interno del servidor
 */
router.put('/users/:id',authenticateJWT, updateUser)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID
 *     description: Permite la eliminación de un usuario existente en el sistema.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []  # Asegúrate de que esto esté presente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a eliminar.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       400:
 *         description: ID de usuario no válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "ID de usuario no válido"
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 */
router.delete('/users/:id',authenticateJWT, deleteUser)

module.exports = router