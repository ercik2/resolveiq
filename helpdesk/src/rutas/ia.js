const express = require('express');
const router = express.Router();
const { analizarTicket, obtenerAnalisis } = require('../controladores/ia');
const { verificarToken, verificarAgente } = require('../middleware/auth');

router.post('/analizar/:id', verificarToken, verificarAgente, analizarTicket);
router.get('/analisis/:id', verificarToken, obtenerAnalisis);

module.exports = router;
