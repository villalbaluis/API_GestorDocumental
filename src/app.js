/**
 * Hacemos el llamado global de los elementos
 * a usar dentro de la aplicación.
 * Express => Servicio de inicio de server
 * Cors => Middleware
 * Config => Configuración obtenida del .env
 * Routes => Rutas a usar dentro de la aplicación
*/
const express = require('express');
const cors = require('cors');
const config = require('./config.js');
const routes = require('./routes.js');

const app = express();

// Config
app.set('port', config.port);

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '25mb' }));

// Routes
app.use(routes);


module.exports = app;
