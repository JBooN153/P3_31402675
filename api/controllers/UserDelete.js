const Usuario = require('../models/usuario'); 
const { AppDataSource } = require('../config/databaseConfig');

// Controlador para eliminar un usuario por id, require token
const deleteUser = async (req, res) => {
    try {
        if (!req.params.id || isNaN(Number(req.params.id))) {
            return res.status(400).json({ status: 'fail', message: 'ID de usuario no válido' });
        }

        const userRepository = AppDataSource.getRepository(Usuario);
        const userId = Number(req.params.id);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
        }

        await userRepository.remove(user);
        res.json({ status: 'success', message: 'Usuario eliminado exitosamente', data: null });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

module.exports = { deleteUser };
