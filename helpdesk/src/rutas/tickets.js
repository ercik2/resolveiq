const express = require('express');
const router = express.Router();
const { obtenerTickets, obtenerTicket, crearTicket, actualizarTicket, eliminarTicket, estadisticasAgente } = require('../controladores/tickets');
const { verificarToken, verificarAdmin, verificarAgente } = require('../middleware/auth');

router.get('/', verificarToken, obtenerTickets);
router.get('/estadisticas-agente', verificarToken, verificarAgente, estadisticasAgente);
router.get('/:id', verificarToken, obtenerTicket);
router.post('/', verificarToken, crearTicket);
router.put('/:id', verificarToken, verificarAgente, actualizarTicket);
router.delete('/:id', verificarToken, verificarAdmin, eliminarTicket);

module.exports = router;
