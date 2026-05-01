const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token requerido' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token inválido' });
    }
};

const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol admin' });
    }
    next();
};

const verificarAgente = (req, res, next) => {
    if (req.usuario.rol !== 'agente' && req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol agente' });
    }
    next();
};

module.exports = { verificarToken, verificarAdmin, verificarAgente };
