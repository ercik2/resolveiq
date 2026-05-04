const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const conexion = require('../config/db');
require('dotenv').config();

const registro = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
        const [usuarioExiste] = await conexion.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (usuarioExiste.length > 0) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await conexion.query(
            'INSERT INTO users (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, rol || 'usuario']
        );

        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [usuarios] = await conexion.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        const usuario = usuarios[0];
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, rol: usuario.rol, nombre: usuario.nombre, id: usuario.id, email: usuario.email, primer_login: usuario.primer_login });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};
const obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await conexion.query(
            'SELECT id, nombre, email, rol, created_at FROM users'
        );
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        await conexion.query('DELETE FROM comentarios WHERE user_id = ?', [req.params.id]);
        await conexion.query('DELETE FROM comentarios WHERE ticket_id IN (SELECT id FROM tickets WHERE user_id = ?)', [req.params.id]);
        await conexion.query('UPDATE tickets SET agente_id = NULL WHERE agente_id = ?', [req.params.id]);
        await conexion.query('DELETE FROM tickets WHERE user_id = ?', [req.params.id]);
        await conexion.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

const cambiarPassword = async (req, res) => {
    const { passwordActual, passwordNuevo, esPrimerLogin } = req.body;
    try {
        const [usuarios] = await conexion.query(
            'SELECT * FROM users WHERE id = ?', [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (!esPrimerLogin) {
            const passwordValido = await bcrypt.compare(passwordActual, usuarios[0].password_hash);
            if (!passwordValido) {
                return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
            }
        }

        const passwordHash = await bcrypt.hash(passwordNuevo, 10);
        await conexion.query(
            'UPDATE users SET password_hash = ?, primer_login = 0 WHERE id = ?',
            [passwordHash, req.usuario.id]
        );

        res.json({ mensaje: 'Contraseña cambiada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

module.exports = { registro, login, obtenerUsuarios, eliminarUsuario, cambiarPassword };
