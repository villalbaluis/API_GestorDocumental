const { getConnection } = require('../../../interface/connectDB');

/**
 * Se toma un número representante de fecha, y se convierte
 * al formato aceptado por PgSQL para la operación en BD
 * @param { date } fecha en formato YYYYMMDD 
 * @returns { date } fecha en formato: YYYY-MM-DD
*/
function convertirFechaBaseDatos(fecha) {
    fecha = String(fecha);
    return fechaFormateada = `${fecha.substr(0, 4)}-${fecha.substr(4, 2)}-${fecha.substr(6, 2)}`;
};

/**
 * Creación de objetivo luego de validación
 * @param { object } objetivo Objeto con información obligatoria.
 * @returns { Promise<Object> } Objeto con información sobre la respuesta del cargue.
*/
const crearObjetivoBaseDatos = async (objetivo) => {

    const pool = await getConnection();

    let {
        nombreObjetivo,
        descripcionObjetivo,
        fechaInicioObjetivo,
        fechaFinObjetivo
    } = objetivo;

    let respuesta;
    let fechaInicioFormateada = convertirFechaBaseDatos(fechaInicioObjetivo),
        fechaFinFormateada = convertirFechaBaseDatos(fechaFinObjetivo);

    const crearObjetivo = await pool.query(`
        INSERT INTO objetivos ("nombreObjetivo", "descripcionObjetivo", "fechaInicioObjetivo", "fechaFinObjetivo")
        VALUES ($1, $2, $3, $4);
    `, [nombreObjetivo, descripcionObjetivo, fechaInicioFormateada, fechaFinFormateada]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: 'Se ha insertado con éxito el objetivo en la base de datos'
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el objetivo a base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el objetivo a base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Actualización del objetivo en base de datos a través de id
 * @param { object } objetivo Objeto con información obligatoria, y id del objetivo.
 * @returns { Promise<Object> } Objeto con información sobre la respuesta del update.
*/
const updateObjetivoBaseDatos = async (objetivo) => {
    
    const pool = await getConnection();

    let {
        nombreObjetivo,
        descripcionObjetivo,
        fechaInicioObjetivo,
        fechaFinObjetivo,
        idObjetivo
    } = objetivo;

    let respuesta;
    let fechaInicioFormateada = convertirFechaBaseDatos(fechaInicioObjetivo),
        fechaFinFormateada = convertirFechaBaseDatos(fechaFinObjetivo);

    const actualizarObjetivo = await pool.query(`
        UPDATE objetivos SET 
            "nombreObjetivo" = $1, 
            "descripcionObjetivo" = $2, 
            "fechaInicioObjetivo" = $3, 
            "fechaFinObjetivo" = $4
        WHERE "idObjetivo" = $5;
    `, [nombreObjetivo, descripcionObjetivo, fechaInicioFormateada, fechaFinFormateada, idObjetivo]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha actualizado con éxito el registro con id: ${idObjetivo}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error actualizando el objetivo: ${idObjetivo}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error actualizando el objetivo: ${idObjetivo}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Eliminación del objetivo en la base de datos
 * @param { number } idObjetivo int del idObjetivo a eliminar
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const deleteObjetivoBaseDatos = async (idObjetivo) => {
    const pool = await getConnection();

    let respuesta;

    const deleteObjetivo = await pool.query(`
        DELETE FROM objetivos WHERE "idObjetivo" = $1;
    `, [idObjetivo]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha eliminado con éxito el objetivo número: ${idObjetivo}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error eliminando el objetivo: ${idObjetivo}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error eliminando el objetivo: ${idObjetivo}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Obtención de todos los objetivos registrados en base de datos
 * @returns { Promise<Object> } Objeto con información de todos los registros.
*/
const showObjetivosBaseDatos = async() => {
    const pool = await getConnection();

    let respuesta;

    const obtenerObjetivos = await pool.query(`
        SELECT * FROM objetivos;
    `).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo todos los objetivos en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo todos los objetivos en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Asignación del area para el objetivo en tabla ObjetivoXArea
 * @param { Object } data Objeto contenedor de los campos de la tabla con valores validados
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const assignObjeArea = async (data) => {

    const pool = await getConnection();
    let respuesta;
    let {
        idObjetivo,
        idArea
    } = data;

    const cargueTarEmp = await pool.query(`
        INSERT INTO "ObjetivoXArea" ("idObjetivo", "idArea") VALUES ($1, $2);
    `, [idObjetivo, idArea]).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se le ha asignado con éxito el area: ${idArea}, al Objetivo: ${idObjetivo}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error asignando la tarea: ${idArea}, al objetivo: ${idObjetivo}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error asignando la tarea: ${idArea}, al objetivo: ${idObjetivo}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

module.exports = {
    crearObjetivoBaseDatos,
    updateObjetivoBaseDatos,
    deleteObjetivoBaseDatos,
    showObjetivosBaseDatos,
    assignObjeArea
};