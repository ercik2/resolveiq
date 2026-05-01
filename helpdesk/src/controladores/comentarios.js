const conexion = require('../config/db');

const obtenerComentarios = async (req, res) => {
    try {
        const [comentarios] = await conexion.query(
            `SELECT c.*, u.nombre as usuario_nombre 
             FROM comentarios c 
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.ticket_id = ?`,
            [req.params.id]
        );

        res.json(comentarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const crearComentario = async (req, res) => {
    const { contenido } = req.body;

    try {
        await conexion.query(
            'INSERT INTO comentarios (ticket_id, user_id, contenido) VALUES (?, ?, ?)',
            [req.params.id, req.usuario.id, contenido]
        );

        res.status(201).json({ mensaje: 'Comentario añadido correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

module.exports = { obtenerComentarios, crearComentario };
