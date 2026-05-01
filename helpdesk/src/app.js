const express = require('express');
const cors = require('cors');
require('dotenv').config();

const rutasAuth = require('./rutas/auth');
const rutasTickets = require('./rutas/tickets');
const rutasComentarios = require('./rutas/comentarios');
const rutasIa = require('./rutas/ia');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', rutasAuth);
app.use('/tickets', rutasTickets);
app.use('/comentarios', rutasComentarios);
app.use('/ia', rutasIa);

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en puerto ${PUERTO}`);
});

module.exports = app;
