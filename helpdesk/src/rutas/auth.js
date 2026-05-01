const express = require('express');
const router = express.Router();
const { registro, login, obtenerUsuarios, eliminarUsuario, cambiarPassword } = require('../controladores/auth');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

router.post('/registro', registro);
router.post('/login', login);
router.get('/usuarios', verificarToken, verificarAdmin, obtenerUsuarios);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, eliminarUsuario);
router.put('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;
