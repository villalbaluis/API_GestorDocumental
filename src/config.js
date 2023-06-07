const { config } = require('dotenv');

config();

module.exports = {
    /**
     * Configuración del servidor, puerto, tipo de ambiente
    */
    port: process.env.PORT || 3000,
    env: process.env.env || 'Dev',

    /**
     * Configuración de la base de datos.
    */
    UserDB: process.env.UserDB,
    PasswordBD: process.env.PasswordBD,
    ServerDB: process.env.ServerDB,
    Database: process.env.Database,
    PortDB: process.env.PortDB,

    /**
     * Configuración de seguridad del JWT.
    */
    JWT_SECRETO: process.env.JWT_SECRETO,
    SALT: process.env.JWT_SALT,
    JWT_TIEMPO_EXPIRA: process.env.JWT_TIEMPO_EXPIRA || '1h',
};