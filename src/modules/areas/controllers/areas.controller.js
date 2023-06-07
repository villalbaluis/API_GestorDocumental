const { getConnection } = require('../../../interface/connectDB');

/**
 * @param { string } fecha => string tipo fecha YYYYMMDD
 * @returns { date } fechaFormateada => date object or null YYYY-MM-DD
*/
function convertirFechas(fecha) {
    if (fecha) {
        fecha = String(fecha);
        const anio = fecha.slice(0, 4);
        const mes = fecha.slice(4, 6) - 1;
        const dia = fecha.slice(6, 8);

        let objetoFecha = new Date(anio, mes, dia);
        return fechaFormateada = objetoFecha.toISOString().split('T')[0];
    } else {
        return null;
    };
};

/**
 * Se crea el area de trabajo en la tabla areas.
 * @param { Object } area => Objeto con toda la información del area
 * @returns { Promise<Object> } response => Objeto con información de la respuesta de la BD.
*/
const crearAreaTrabajo = async (area) => {
    const pool = await getConnection();
    let {
        nombreArea,
        descripcionArea,
        fechaInicioArea,
        idJefeArea, 
        idGerenteArea
    } = area;

    let response;
    let fechaInicioAreaConvertida = convertirFechas(fechaInicioArea);
    
    const cargueArea = await pool.query(`
        INSERT INTO areas ("nombreArea", "descripcionArea", "fechaInicioArea", "estadoArea", "idJefeArea", "idGerenteArea")
        VALUES ($1, $2, $3, $4, $5, $6);
    `, [nombreArea, descripcionArea, fechaInicioAreaConvertida, true, idJefeArea, idGerenteArea]
    ).then(data => {
        if (data.rowCount > 0) {
            response = {
                ok: true,
                status_cod: 200,
                data: `Se ha insertado con éxito el área en base de datos.`,
            }
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el área en la base de datos, error: ${err}`);
        response = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el área en la base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return response;
};

/**
 * Se actualizará el area de trabajo, a través de su ID.
 * @param { Object } area => Objeto con toda la información del area
 * @returns { Promise<Object> } response => Objeto con información de la respuesta de la BD.
*/
const updateAreaTrabajo = async (area) => {
    const pool = await getConnection();
    let {
        nombreArea,
        descripcionArea,
        fechaInicioArea,
        estadoArea,
        idArea
    } = area;

    let response;
    let fechaInicioAreaConvertida = convertirFechas(fechaInicioArea);

    const actualizarArea = await pool.query(`
        UPDATE areas SET 
            "nombreArea" = $1,
            "descripcionArea" = $2,
            "fechaInicioArea" = $3,
            "estadoArea" = $4
        WHERE "idArea" = $5;
    `, [nombreArea, descripcionArea, fechaInicioAreaConvertida, estadoArea, idArea]
    ).then(data => {
        if (data.rowCount > 0) {
            response = {
                ok: true,
                status_cod: 200,
                data: `Se ha actualizado con éxito el área: ${idArea} en la base de datos.`,
            }
        };
    }).catch((err) => {
        console.log(`Ocurrió un error actualizando el área: ${idArea}  en la base de datos, error: ${err}`);
        response = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error actualizando el área: ${idArea}  en la base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return response;
};

/**
 * Eliminación del area en la base de datos
 * @param { number } idTarea int del idArea a eliminar
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const deleteAreaBaseDatos = async (idArea) => {
    const pool = await getConnection();

    let respuesta;
    
    const deleteObjetivo = await pool.query(`
        UPDATE areas SET "estadoArea" = false WHERE "idArea" = $1;
    `, [idArea]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha eliminado con éxito la tarea número: ${idArea}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error eliminando la tarea: ${idArea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error eliminando la tarea: ${idArea}, en base de datos, error: ${err}`,
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

    const obtenerAreas = await pool.query(`
        SELECT * FROM areas WHERE "estadoArea" IS NOT false;
    `).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                data: data.rows
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo todas las areas en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo todas las areas en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

module.exports = {
    crearAreaTrabajo,
    updateAreaTrabajo,
    deleteAreaBaseDatos,
    showAreasBaseDatos
};
