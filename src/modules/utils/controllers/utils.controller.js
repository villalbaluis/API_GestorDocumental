const { getConnection } = require('../../../interface/connectDB');

/**
 * Consultamos los roles generados en base de datos. 
 * @returns { Promise<Array> } respuesta
*/
const consultaRoles = async () => {

    const pool = await getConnection();
    let respuesta;

    let consultaRoles = await pool.query(`
        SELECT * FROM roles;
    `).then(data => {
        if (data.rowCount > 0) {
            respuesta = {
                ok: true,
                status: 200,
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error consultando la información de los roles, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error consultando la información de los roles, error: ${err}`
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Consultamos los horarios generados en base de datos.
 * @returns { Promise<Array> } respuesta
*/
const consultaHorarios = async () => {

    const pool = await getConnection();
    let respuesta;

    let consultaHorarios = await pool.query(`
        SELECT * FROM horarios;
    `).then(data => {
        if (data.rowCount > 0) {
            respuesta = {
                ok: true,
                status: 200,
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error consultando la información de los horarios en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error consultando la información de los horarios en base de datos, error: ${err}`
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Consultamos los estados de las tareas en la base de datos. 
 * @returns { Promise<Array> } respuesta
*/
const consultaEstadosTareas = async () => {

    const pool = await getConnection();
    let respuesta;

    let consultaEstados = await pool.query(`
        SELECT * FROM estados;
    `).then(data => {
        if (data.rowCount > 0) {
            respuesta = {
                ok: true,
                status: 200,
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error consultando los estados de las tareas en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status: 500,
            data: `Ocurrió un error consultando los estados de las tareas en base de datos, error: ${err}`
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Obtención de todas las areas registradas en base de datos
 * @returns { Promise<Object> } Objeto con información de todos los registros.
*/
const showAreasBaseDatos = async() => {
    const pool = await getConnection();

    let respuesta;

    const obtenerTareas = await pool.query(`
        SELECT * FROM tareas;
    `).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo todas las tareas en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo todas las tareas en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

module.exports = {
    consultaRoles,
    consultaHorarios,
    consultaEstadosTareas,
    showAreasBaseDatos
};
