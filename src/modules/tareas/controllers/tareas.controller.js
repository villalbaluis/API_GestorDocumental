const { getConnection } = require('../../../interface/connectDB');

/**
 * @param { number } fecha en formato YYYYMMDD 
 * @returns { date } fecha en formato: YYYY-MM-DD
*/
function convertirFechaBaseDatos(fecha) {
    fecha = String(fecha);
    return fechaFormateada = `${fecha.substr(0, 4)}-${fecha.substr(4, 2)}-${fecha.substr(6, 2)}`;
};

/**
 * Creación de tarea en base de datos
 * @param { object } tarea Objeto con información obligatoria de la actividad tarea.
 * @returns { Promise<Object> } Objeto con información sobre la respuesta del cargue.
*/
const crearTareaBaseDatos = async (tarea) => {

    const pool = await getConnection();

    let {
        idEstado,
        nombreTarea,
        descripcionTarea,
        fechaInicioTarea,
        fechaFinTarea,
        duracion,
        dificultad
    } = tarea;

    let respuesta;
    let fechaInicioFormateada = convertirFechaBaseDatos(fechaInicioTarea),
        fechaFinFormateada = convertirFechaBaseDatos(fechaFinTarea);

    const cargueTarea = await pool.query(`
        INSERT INTO tareas 
                    ("idEstado", "nombreTarea", "descripcionTarea", "fechaInicioTarea", "fechaFinTarea", "duracion", "dificultad", "estadoTareas")
        VALUES 
                    ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [idEstado, nombreTarea, descripcionTarea, fechaInicioFormateada, fechaFinFormateada, duracion, dificultad, true]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: 'Se ha insertado con éxito la tarea en la base de datos'
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando la tarea a base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando la tarea a base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Actualización de tarea especifica
 * @param { object } tarea Objeto con información obligatoria de la tarea actualizar.
 * @returns { Promise<Object> } Objeto con información sobre la respuesta del cargue.
*/
const updateTareaBaseDatos = async (tarea) => {
    const pool = await getConnection();

    let {
        idEstado,
        nombreTarea,
        descripcionTarea,
        fechaInicioTarea,
        fechaFinTarea,
        duracion,
        dificultad,
        estadoTareas,
        idTarea
    } = tarea;

    let respuesta;
    let fechaInicioFormateada = convertirFechaBaseDatos(fechaInicioTarea),
        fechaFinFormateada = convertirFechaBaseDatos(fechaFinTarea);

    const cargueTarea = await pool.query(`
        UPDATE tareas SET
            "idEstado" = $1,
            "nombreTarea" = $2,
            "descripcionTarea" = $3,
            "fechaInicioTarea" = $4,
            "fechaFinTarea" = $5,
            "duracion" = $6,
            "dificultad" = $7,
            "estadoTareas" = $8
        WHERE "idTarea" = $9;
    `, [idEstado, nombreTarea, descripcionTarea, fechaInicioFormateada, fechaFinFormateada, duracion, dificultad, estadoTareas, idTarea]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha actualizado con éxito la tarea con id: ${idTarea}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error actualizando la tarea: ${idTarea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error actualizando la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Eliminación de la tarea en la base de datos
 * @param { number } idTarea int del idTarea a eliminar
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const deleteTareaBaseDatos = async (idTarea) => {
    const pool = await getConnection();

    let respuesta;

    const deleteTarea = await pool.query(`
        UPDATE tareas SET "estadoTareas" = false WHERE "idTarea" = $1;
    `, [idTarea]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha eliminado con éxito la tarea número: ${idTarea}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error eliminando la tarea: ${idTarea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error eliminando la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Obtención de todas las tareas registradas en base de datos
 * @returns { Promise<Object> } Objeto con información de todos los registros.
*/
const showTareasBaseDatos = async () => {
    const pool = await getConnection();

    let respuesta;

    const obtenerTareas = await pool.query(`
        SELECT * FROM tareas ORDER BY "idTarea" ASC;
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

/**
 * Se obtiene una single task de la base de datos
 * @param { number } idTarea int del idTarea a eliminar
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const getTareaBaseDatos = async (idTarea) => {
    const pool = await getConnection();

    let respuesta, infoTarea, infoEmpleado, infoEvidencias;

    const getSingleTask = await pool.query(`
        SELECT  t."nombreTarea" AS titulo, t."descripcionTarea" AS descripcion,
            t."fechaFinTarea" AS inicio, t."fechaFinTarea" AS fin, t.duracion AS duracion,
            t.dificultad AS puntos, e."nombreEstado" AS estado, o."nombreObjetivo" AS objetivo
        FROM tareas AS t
            INNER JOIN "TareaXObjetivo" AS tarobj on t."idTarea" = tarobj."idTarea"
            INNER JOIN estados e on e."idEstado" = t."idEstado"
            INNER JOIN objetivos o on o."idObjetivo" = tarobj."idObjetivo"
        WHERE t."idTarea" = $1 AND t."estadoTareas" IS NOT false;
    `, [idTarea]
    ).then(data => {
        if (data) {
            infoTarea = data.rows
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo la tarea: ${idTarea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    });

    const getEmpleadoTask = await pool.query(`
        SELECT  taremp."avanceEmpleado" AS avancEmpleado, taremp."avanceJefe" AS avanceJefe, CASE WHEN (taremp.aprobada IS false)  THEN 'NO' END AS aprobada,
            emp."nombreEmpleado" AS encargado
        FROM tareas AS t
            INNER JOIN "TareasXEmpleado" AS taremp on t."idTarea" = taremp."idTarea"
            INNER JOIN empleados AS emp on taremp."idEmpleado" = emp."idEmpleado"
        WHERE t."idTarea" = $1;
    `, [idTarea]
    ).then(data => {
        if (data) {
            infoEmpleado = data.rows
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo el empleado de la tarea: ${idTarea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo el empleado de la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    });

    const getEvidenciaTask = await pool.query(`
        SELECT  evi."nombreArchivo" AS evidencia, evi."rutaArchivo" AS ruta, emp."nombreEmpleado" AS evidenciaEmpleado
        FROM tareas AS t
            INNER JOIN "evidencias" AS evi on t."idTarea" = evi."idTarea"
            INNER JOIN empleados AS emp on evi."idEmpleado" = emp."idEmpleado"
        WHERE t."idTarea" = $1;
    `, [idTarea]
    ).then(data => {
        if (data) {
            infoEvidencias = data.rows
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo las evidencias de la tarea: ${idTarea}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo las evidencias de la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    respuesta = {
        status_cod: 200,
        status: '200 Ok.',
        tarea: infoTarea,
        empleados: infoEmpleado,
        evidencias: infoEvidencias,
    }
    return respuesta;
};

/**
 * Asignación de tarea a empleado, a través de tabla TareasXEmpleado
 * @param { Object } data Objeto contenedor de los campos de la tabla con valores validados
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const assignTarEmp = async (data) => {

    const pool = await getConnection();
    let respuesta;
    let {
        idTarea,
        idEmpleado,
        avanceEmpleado,
        avanceJefe,
        aprobada
    } = data;

    const cargueTarEmp = await pool.query(`
        INSERT INTO "TareasXEmpleado" ("idTarea", "idEmpleado", "avanceEmpleado", "avanceJefe", "aprobada") VALUES ($1, $2, $3, $4, $5);
    `, [idTarea, idEmpleado, avanceEmpleado, avanceJefe, aprobada]).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se le ha asignado con éxito la tarea: ${idTarea}, al empleado: ${idEmpleado}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error asignando la tarea: ${idTarea}, al empleado: ${idEmpleado}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error asignando la tarea: ${idTarea}, al empleado: ${idEmpleado}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Asignación de tarea a objetivo, a través de tabla TareaXObjetivo
 * @param { Object } data Objeto contenedor de los campos de la tabla con valores validados
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const assignTarObj = async (data) => {

    const pool = await getConnection();
    let respuesta;
    let {
        idTarea,
        idObjetivo
    } = data;

    const cargueTarObj = await pool.query(`
        INSERT INTO "TareaXObjetivo" ("idTarea", "idObjetivo") VALUES ($1, $2);
    `, [idTarea, idObjetivo]).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se le ha asignado con éxito la tarea: ${idTarea}, al Objetivo: ${idObjetivo}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error asignando la tarea: ${idTarea}, al Objetivo: ${idObjetivo}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error asignando la tarea: ${idTarea}, al Objetivo: ${idObjetivo}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Creación de una evidencia perteneciente a una tarea, en tabla evidencias
 * @param { Object } data Objeto contenedor de los campos de la tabla con valores validados
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const crearEvidenciaTareaBaseDatos = async (data) => {
    const pool = await getConnection();
    let respuesta;
    let {
        idTarea,
        nombreArchivo,
        rutaArchivo,
        idEmpleado
    } = data;

    const cargueEvidencia = await pool.query(`
        INSERT INTO evidencias ("idTarea", "nombreArchivo", "rutaArchivo", "estadoEvidencias", "idEmpleado") 
        VALUES ($1, $2, $3, $4, $5);
    `, [idTarea, nombreArchivo, rutaArchivo, true, idEmpleado]
    ).then(data => {
        if (data) {
            if (data.rowCount > 0) {
                respuesta = {
                    ok: true,
                    status_cod: 200,
                    mensaje: `Se le ha asignado con éxito a la tarea: ${idTarea}, la evidencia solicitada, por el empleado: ${idEmpleado}`
                };
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error asignando a la tarea: ${idTarea}, la evidencia solicitada, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error asignando a la tarea: ${idTarea}, la evidencia solicitada, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Operación de actualización de TareaXEmpleado
 * @param { Object } data Información de la TareaXEmpleado a actualizar
 * @returns { Promise<Object> } Objeto con información éxitosa o erronea.
*/
const updateTareaXEmpleado = async (data) => {
    const pool = await getConnection();
    let respuesta, aprobada;

    let {
        idTarea,
        idEmpleado,
        avanceEmpleado,
        avanceJefe,
        idTareaXEmpleado
    } = data;

    if (avanceJefe == 0 || avanceEmpleado == 0) {
        aprobada = false;
    };

    if (avanceJefe == 100 && avanceEmpleado == 100) {
        aprobada = true;
    } else {
        aprobada = false;
    };

    const actuTareaXEmpleado = await pool.query(`
        UPDATE "TareasXEmpleado" SET
            "idTarea" = $1,
            "idEmpleado" = $2,
            "avanceEmpleado" = $3,
            "avanceJefe" = $4,
            "aprobada" = $5
        WHERE "idTarEmp" = $6;
    `, [idTarea, idEmpleado, avanceEmpleado, avanceJefe, aprobada, idTareaXEmpleado]
    ).then(data => {
        if (data) {
            respuesta = {
                status_cod: 200,
                status: '200 Ok.',
                mensaje: `Se ha actualizado con éxito la TareaXEmpleado con id: ${idTareaXEmpleado}`
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error actualizando la TareaXEmpleado: ${idTareaXEmpleado}, en base de datos, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error actualizando la tarea: ${idTarea}, en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;

};

module.exports = {
    crearTareaBaseDatos,
    updateTareaBaseDatos,
    deleteTareaBaseDatos,
    showTareasBaseDatos,
    getTareaBaseDatos,
    assignTarEmp,
    assignTarObj,
    crearEvidenciaTareaBaseDatos,
    updateTareaXEmpleado
};