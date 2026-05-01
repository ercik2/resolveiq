const conexion = require('../config/db');

const obtenerTickets = async (req, res) => {
    try {
        let consulta;
        let parametros = [];

        if (req.usuario.rol === 'usuario') {
            consulta = `SELECT t.*, u.nombre as usuario_nombre, a.nombre as agente_nombre 
                       FROM tickets t 
                       LEFT JOIN users u ON t.user_id = u.id 
                       LEFT JOIN users a ON t.agente_id = a.id
                       WHERE t.user_id = ?`;
            parametros = [req.usuario.id];
        } else {
            consulta = `SELECT t.*, u.nombre as usuario_nombre, a.nombre as agente_nombre 
                       FROM tickets t 
                       LEFT JOIN users u ON t.user_id = u.id 
                       LEFT JOIN users a ON t.agente_id = a.id`;
        }

        const [tickets] = await conexion.query(consulta, parametros);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const obtenerTicket = async (req, res) => {
    try {
        const [ticket] = await conexion.query(
            `SELECT t.*, u.nombre as usuario_nombre, a.nombre as agente_nombre 
             FROM tickets t 
             LEFT JOIN users u ON t.user_id = u.id 
             LEFT JOIN users a ON t.agente_id = a.id
             WHERE t.id = ?`,
            [req.params.id]
        );

        if (ticket.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        if (req.usuario.rol === 'usuario' && ticket[0].user_id !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }

        res.json(ticket[0]);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const crearTicket = async (req, res) => {
    const { titulo, descripcion, prioridad } = req.body;
    try {
        const [resultado] = await conexion.query(
            'INSERT INTO tickets (titulo, descripcion, prioridad, user_id) VALUES (?, ?, ?, ?)',
            [titulo, descripcion, prioridad || 'media', req.usuario.id]
        );
        res.status(201).json({ mensaje: 'Ticket creado correctamente', id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const actualizarTicket = async (req, res) => {
    const { estado, prioridad, agente_id } = req.body;
    try {
        await conexion.query(
            'UPDATE tickets SET estado = ?, prioridad = ?, agente_id = ? WHERE id = ?',
            [estado, prioridad, agente_id, req.params.id]
        );
        res.status(200).json({ mensaje: 'Ticket actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const eliminarTicket = async (req, res) => {
    try {
        await conexion.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        res.status(200).json({ mensaje: 'Ticket eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const estadisticasAgente = async (req, res) => {
    try {
        const [stats] = await conexion.query(
            `SELECT 
                COUNT(*) as total_asignados,
                SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
                SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
                SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos
             FROM tickets 
             WHERE agente_id = ?`,
            [req.usuario.id]
        );
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

module.exports = { obtenerTickets, obtenerTicket, crearTicket, actualizarTicket, eliminarTicket, estadisticasAgente };
