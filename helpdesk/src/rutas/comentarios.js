const express = require('express');
const router = express.Router();
const { obtenerComentarios, crearComentario } = require('../controladores/comentarios');
const { verificarToken } = require('../middleware/auth');

router.get('/:id/comentarios', verificarToken, obtenerComentarios);
router.post('/:id/comentarios', verificarToken, crearComentario);

module.exports = router;
