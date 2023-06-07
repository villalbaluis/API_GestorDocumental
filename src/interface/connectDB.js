/**
 * Importaciones de elementos para conexión.
 * pg => Paquete node para conexiones a PgSQL
 * config => Archivo con credenciales de conexión.
*/
const { Pool } = require('pg');
const config = require('../config.js');

const dbauth = {
    user: config.UserDB,
    password: `${config.PasswordBD}`,
    host: config.ServerDB,
    database: config.Database,
    port: config.PortDB,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

/**
 * Método para conectarse a la base de datos
 * @returns {Promise<Pool>}
 */
function getConnection() {
    return new Pool(dbauth);
}

module.exports.getConnection = getConnection;