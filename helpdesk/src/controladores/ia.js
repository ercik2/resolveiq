const { Ollama } = require('ollama');
const conexion = require('../config/db');

const ollama = new Ollama({ host: 'http://192.168.56.1:11434' });

const analizarTicket = async (req, res) => {
    const { id } = req.params;

    try {
        const [tickets] = await conexion.query(
            `SELECT t.*, u.nombre as usuario_nombre, a.nombre as agente_nombre
             FROM tickets t
             LEFT JOIN users u ON t.user_id = u.id
             LEFT JOIN users a ON t.agente_id = a.id
             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        const [comentarios] = await conexion.query(
            `SELECT c.contenido, u.nombre as autor
             FROM comentarios c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.ticket_id = ?`,
            [id]
        );

        const ticket = tickets[0];
        const historialComentarios = comentarios.map(c => `${c.autor}: ${c.contenido}`).join('\n');
	const fechaActual = new Date().toLocaleDateString('es-ES');

        const prompt = `Eres un asistente técnico de soporte IT. Analiza la siguiente incidencia y genera documentación técnica en español.

INCIDENCIA #${ticket.id}
Título: ${ticket.titulo}
Descripción: ${ticket.descripcion}
Estado: ${ticket.estado}
Prioridad: ${ticket.prioridad}
Usuario: ${ticket.usuario_nombre}
Agente asignado: ${ticket.agente_nombre || 'Sin asignar'}

Historial de comentarios:
${historialComentarios || 'Sin comentarios'}

Genera un informe con exactamente estas secciones:
1. RESUMEN DEL PROBLEMA: Describe el problema en 2-3 frases claras.
2. SOLUCIÓN APLICADA: Describe la solución aplicada basándote en los comentarios. Si no hay solución aún, indica los pasos en curso.
3. MEJORAS FUTURAS: Sugiere 2-3 mejoras para evitar que este problema se repita.

Sé conciso y técnico.`;

        const respuesta = await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: prompt }]
        });

        const analisis = respuesta.message.content;

        await conexion.query(
            'UPDATE tickets SET analisis_ia = ? WHERE id = ?',
            [analisis, id]
        );

        res.json({ analisis });
    } catch (error) {
        console.error('Error al analizar ticket:', error);
        res.status(500).json({ mensaje: 'Error al analizar el ticket', error: error.message });
    }
};

const obtenerAnalisis = async (req, res) => {
    const { id } = req.params;
    try {
        const [tickets] = await conexion.query(
            'SELECT analisis_ia FROM tickets WHERE id = ?',
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        res.json({ analisis: tickets[0].analisis_ia });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

module.exports = { analizarTicket, obtenerAnalisis };
