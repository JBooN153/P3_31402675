const Usuario = require('../models/usuario'); 
const { AppDataSource } = require('../config/databaseConfig');

// Controlador para ver todos los usuarios en la db, require token
const getAllUsers = async (req, res) => {
    try {
        const usuarios = await AppDataSource.getRepository(Usuario).find();
        res.status(200).json({
            status: "success",
            data: {
                usuarios,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Error al obtener los usuarios",
        });
    }
};

// Controlador para buscar un usuario especifico en la db por id, require token
const getUserById = async (req, res) => {
    try {
        if (!req.params.id || isNaN(Number(req.params.id))) {
            return res.status(400).json({
                status: "fail",
                message: "ID de usuario no válido",
            });
        }

        const userRepository = AppDataSource.getRepository(Usuario);
        const user = await userRepository.findOneBy({ id: Number(req.params.id) });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById
};
