const Usuario = require('../models/usuario'); 
const { AppDataSource } = require('../config/databaseConfig');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Controlador Usercreate por token
const createUser = async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;

        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ status: "fail", message: "Todos los campos son obligatorios" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: "fail", message: "El correo electrónico no es válido" });
        }

        const existingUser = await AppDataSource.getRepository(Usuario).findOneBy({ email });
        if (existingUser) {
            return res.status(409).json({ status: "fail", message: "El correo ya está en uso" });
        }

        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const usuario = AppDataSource.getRepository(Usuario).create({
            nombre,
            email,
            contrasena: hashedPassword,
        });

        await AppDataSource.getRepository(Usuario).save(usuario);

        res.status(201).json({
            status: "success",
            data: {
                usuario,
            },
        });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({
            status: "error",
            message: "Error al crear el usuario",
        });
    }
};

// Controlador para actualizar usuarios por id, require token
const updateUser = async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(Usuario);

        if (!req.params.id || isNaN(Number(req.params.id))) {
            return res.status(400).json({ status: "fail", message: "ID de usuario no válido" });
        }

        const userId = Number(req.params.id);
        const usuario = await userRepository.findOneBy({ id: userId });

        if (!usuario) {
            return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: "fail", message: "No se proporcionaron datos para actualizar" });
        }

        const camposRequeridos = ['nombre', 'apellido', 'email'];

        for (const campo of camposRequeridos) {
            if (req.body[campo] !== undefined) {
                const valorCampo = req.body[campo].trim();
                
                if (valorCampo === '') {
                    return res.status(400).json({ 
                        status: "fail", 
                        message: `El campo '${campo}' no puede estar vacío` 
                    });
                }

                req.body[campo] = valorCampo;
            }
        }

        const { email } = req.body;
        if (email && email !== usuario.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: "fail", message: "Formato de correo electrónico inválido" });
            }

            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                return res.status(409).json({ status: "fail", message: "El correo ya está en uso" });
            }
        }

        if (req.body.contrasena) {
            if (req.body.contrasena.length < 8) {
                return res.status(400).json({ 
                    status: "fail", 
                    message: "La contraseña debe tener al menos 8 caracteres" 
                });
            }

            req.body.contrasena = await bcrypt.hash(req.body.contrasena, saltRounds);
        }

        userRepository.merge(usuario, req.body);
        await userRepository.save(usuario);

        res.json({ status: 'success', data: usuario });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

module.exports = { createUser, updateUser };
