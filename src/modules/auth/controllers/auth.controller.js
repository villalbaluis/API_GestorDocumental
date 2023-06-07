const { getConnection } = require('../../../interface/connectDB');
const bcrypt = require('bcrypt');

/**
 * @param { string } fecha => string tipo fecha 
 * @returns { date } fechaFormateada => date object or null
*/
function convertirFechas(fecha) {
    if (fecha) {
        fecha = String(fecha)
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
 * Se obtiene la fecha y hora exacta actual, en formato
 * de base de datos, para su posterior manejo.
 * @returns { string } YYYY-MM-DD HH:MM:ss
*/
function obtenerFechaHoraActual() {
    const zonaHoraria = 'America/Bogota';
    const fechaHoraActual = new Date().toLocaleString('es-ES', { timeZone: zonaHoraria, hour12: false });
    const [fecha, hora] = fechaHoraActual.split(', ');
    const [dia, mes, anio] = fecha.split('/');
    const fechaFormateada = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    const fechaHoraFormateada = `${fechaFormateada} ${hora}`;
    return fechaHoraFormateada;
};

/**
 * Formatea una fecha en el formato "día, nombre mes, año" en español.
 * @param {string} fechaString - La fecha en formato de cadena.
 * @returns {string} La fecha formateada en el formato "día, nombre mes, año".
 */
function formateoFechaMes(fechaString) {
    let fechaFormateada;
    if (fechaString) {
        let fecha = new Date(fechaString);
        const nombresMeses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        let dia = fecha.getDate();
        let mes = nombresMeses[fecha.getMonth()];
        let anio = fecha.getFullYear();
        fechaFormateada = dia + ", " + mes + ", " + anio;
    } else {
        fechaFormateada = '';
    };
    return fechaFormateada;
}

/**
 * Creamos el usuario en la tabla empleados, devolviendo 
 * el id del registro creado en BD
 * @param { Object } usuario => Toda la información del usuario
 * @returns { Promise<number> } idEmpleado => id del registro insertado en BD
*/
const createUserEmpleados = async (usuario) => {
    const pool = await getConnection();
    let {
        nombreEmpleado,
        cedulaEmpleado,
        direccionEmpleado,
        telefonoEmpleado,
        fechaInicioLaboresEmpleado,
        fechaFinContratoEmpleado,
        username,
        password,
        correo,
        numeroContrato,
        estadoEmpleado,
        idHorario,
        idArea,
    } = usuario;

    let respuesta;
    let fechaInicioLabores = convertirFechas(fechaInicioLaboresEmpleado);
    let fechaFinLabores = convertirFechas(fechaFinContratoEmpleado);
    const ecryptedPassword = await bcrypt.hash(password, 10);

    const cargueEmpleado = await pool.query(`
        INSERT INTO empleados (
                                "nombreEmpleado", "cedulaEmpleado", "direccionEmpleado", 
                                "telefonoEmpleado", "fechaInicioLaboresEmpleado", "fechaFinContratoEmpleado", 
                                username, password, correo, "numeroContrato", "estadoEmpleados", "idHorario", "idArea"
                            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING "idEmpleado";
    `, [nombreEmpleado, cedulaEmpleado, direccionEmpleado, telefonoEmpleado, fechaInicioLabores, fechaFinLabores, username, ecryptedPassword, correo, numeroContrato, estadoEmpleado, idHorario, idArea]
    ).then(data => {
        if (data.rowCount > 0) {
            respuesta = {
                ok: true,
                status_cod: 200,
                data: `Se ha creado con éxito el empleado, se asigno el id: ${data.rows[0].idEmpleado}`,
                idEmpleado: data.rows[0].idEmpleado
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error ingresando el usuario a la tabla empleados, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error ingresando el usuario a la tabla empleados, error: ${err}`,
        };
    }).finally(() => pool.end());

    return respuesta;
};

/**
 * Se creará el usuario en la tabla de sesiones, para manejar
 * las sesiones de trabajo del usuario.
 * @param { number } idEmpleado Integer del empleado recién creado
 * @returns { Promise<Boolean> } True para creación, False para error
*/
const createUserSession = async (datos, idEmpleado) => {

    let exitoso = false, errorCargue;
    const pool = await getConnection();

    const cargueSesion = await pool.query(`
        INSERT INTO sesiones ("idEmpleado", "estadoSesiones")
        VALUES ($1, $2, $3, $4);
    `, [idEmpleado, true]
    ).then(data => {
        if (data.rowCount > 0) {
            exitoso = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el usuario a la tabla de sesión, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el usuario a la tabla de sesión, error: ${err}`,
        }
    }).finally(() => pool.end());

    if (exitoso == true) {
        return exitoso;
    } else {
        return errorCargue;
    }

};

/**
 * Se le asignará el rol al empleado, en caso de no tener un rol especifico
 * se le asignará el rol 4 (Por defecto)
 * @param { number } idEmpleado Id del empleado recién creado
 * @param { number } idRol Id del rol asignado al empleado desde el endpoint
 * @returns { Promise<Boolean> } True para creación, False para error
*/
const createUserRol = async (idEmpleado, idRol) => {

    let exitoso = false, errorCargue;
    const pool = await getConnection();

    const cargueRolEmpleado = await pool.query(`
        INSERT INTO "EmpleadoXRol" ("idEmpleado", "idRol")
        VALUES ($1, $2);
    `, [idEmpleado, idRol]
    ).then(data => {
        if (data.rowCount > 0) {
            exitoso = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el rol del empleado en la tabla de EmpleadoXRol: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el rol del empleado en la tabla de EmpleadoXRol: ${err}`,
        };
    }).finally(() => pool.end());

    if (exitoso == true) {
        return exitoso;
    } else {
        return errorCargue;
    };

};

/**
 * Se guardara la información del salario del empleado a través del dato proporcionado
 * @param { number } idEmpleado Id del empleado recién creado
 * @param { number } salarioBase número representativo de dinero como salario
 * @returns { Promise<Boolean> } True para creación, False para error
*/
const createUserSalario = async (idEmpleado, salarioBase) => {

    let exitoso = false, errorCargue;
    const pool = await getConnection();

    const cargueSalarioEmpleado = await pool.query(`
        INSERT INTO salarios ("idEmpleado", "salarioBase")
        VALUES ($1, $2);
    `, [idEmpleado, salarioBase]
    ).then(data => {
        if (data.rowCount > 0) {
            exitoso = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el salario del empleado en la tabla de salarios: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el salario del empleado en la tabla de salarios: ${err}`,
        };
    }).finally(() => pool.end());

    if (exitoso == true) {
        return exitoso;
    } else {
        return errorCargue;
    };

};

/**
 * Se guardara la información del horario del empleado en tabla HorasXEmpleados
 * @param { number } idEmpleado Id del empleado recién creado
 * @param { number } idHorario número representativo de dinero como salario
 * @returns { Promise<Boolean> } True para creación, False para error
*/
const createUserHorario = async (idEmpleado, idHorario) => {

    let exitoso = false, errorCargue;
    const pool = await getConnection();

    const cargueHorarioEmpleado = await pool.query(`
        INSERT INTO "HorasXEmpleados" ("idEmpleado", "idHorario")
        VALUES ($1, $2);
    `, [idEmpleado, idHorario]
    ).then(data => {
        if (data.rowCount > 0) {
            exitoso = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error insertando el horario del empleado en la tabla de HorasXEmpleados: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error insertando el horario del empleado en la tabla de HorasXEmpleados: ${err}`,
        };
    }).finally(() => pool.end());

    if (exitoso == true) {
        return exitoso;
    } else {
        return errorCargue;
    };
};

/**
 * Se actuliza la contraseña del usuario en la sesión.
 * @param { string } user Email o nombre de usuario del empleado
 * @param { string } pass Nueva contraseña del empleado
 * @param { bool } validador True or false, para query de correo o username
 * @returns { Promise<Boolean> } True para actualización, False para error
*/
const cambiarPassEmpleado = async (user, pass, validador) => {

    const pool = await getConnection();
    let queryEncontrar, queryPass, empleado, errorCargue, userEncontrado = false, passActualizada = false;

    if (validador == true) {
        queryEncontrar = `SELECT * FROM empleados WHERE "correo" = '${user}';`;
    } else {
        queryEncontrar = `SELECT * FROM empleados WHERE "username" = '${user}';`;
    };

    const consultarUsuario = await pool.query(
        `${queryEncontrar}`
    ).then(data => {
        if (data.rowCount > 0) {
            empleado = data.rows;
            userEncontrado = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error en la petición de encontrar usuario, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error en la petición de encontrar usuario, error: ${err}`,
        };
    });

    if (userEncontrado == false) {
        return errorCargue;
    } else {
        const ecryptedPassword = await bcrypt.hash(pass, 10);
        queryPass = `UPDATE empleados SET "password" = '${ecryptedPassword}' WHERE "idEmpleado" = '${empleado[0].idEmpleado}';`
    };

    const actualizarPassword = await pool.query(
        `${queryPass}`
    ).then(data => {
        if (data.rowCount > 0) {
            passActualizada = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error actualizando la contraseña del usuario, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error actualizando la contraseña del usuario, error: ${err}`,
        };
    }).finally(() => pool.end());

    if (errorCargue) {
        return errorCargue;
    } else {
        return passActualizada;
    }
};

/**
 * Se hace la lógica para el login de empleado y registro de sesión.
 * @param { string } user Email o nombre de usuario del empleado
 * @param { string } pass Posible contraseña del empleado
 * @returns { Promise<Object> } Objeto con toda la información relacionada del empleado
*/
const loginEmpleado = async (user, pass) => {

    const pool = await getConnection();
    let errorCargue, empleadoSesion, idEmpleado, infoRolEmpleado, infoAreaEmpleado, mensajeError, passValida = false, userEncontrado = false;

    const consultaEmpleado = await pool.query(
        `SELECT * FROM empleados WHERE username = $1`,
        [user]).then(data => {
            if (data.rowCount > 0) {
                empleadoSesion = data.rows[0];
                userEncontrado = true
            } else {
                mensajeError = `No se encontrarón datos relacionados con el usuario y contraseña ingresados`
                userEncontrado = false
            };
        }).catch((err) => {
            mensajeError = `Ocurrió un error en la petición de encontrar usuario para login, error: ${err}`
            console.log(mensajeError);            
        });

    if (mensajeError || userEncontrado == false) {
        return mensajeError;
    };

    empleadoSesion.direccionEmpleado = empleadoSesion.direccionEmpleado.trim();
    empleadoSesion.telefonoEmpleado = empleadoSesion.telefonoEmpleado.trim();
    let fechaInicio = String(empleadoSesion.fechaInicioLaboresEmpleado);
    let fechaFin = String(empleadoSesion.fechaFinContratoEmpleado);
    empleadoSesion.fechaInicioLaboresEmpleado = formateoFechaMes(fechaInicio);
    if (fechaFin) {
        empleadoSesion.fechaFinContratoEmpleado = formateoFechaMes(fechaFin);
    };

    idEmpleado = empleadoSesion.idEmpleado;
    let passDataBase = empleadoSesion.password;

    const comparador = await bcrypt.compare(pass, passDataBase);
    if (comparador) {
        passValida = true;
    } else {
        errorCargue = {
            ok: false,
            status_cod: 400,
            data: `La contraseña ingresada, no coincide con la contraseña del usuario.`,
        };
        return errorCargue
    };

    const obtenerRolEmpleado = await pool.query(`
            SELECT r."idRol" AS idrol, r."nombreRol" AS rol, r."descripcionRol" AS descripcionRol
            FROM empleados AS e
                INNER JOIN "EmpleadoXRol" AS er ON e."idEmpleado" = er."idEmpleado"
                INNER JOIN roles AS r ON er."idRol" = r."idRol"
            WHERE e."idEmpleado" = $1
        `, [idEmpleado]
    ).then(data => {
        if (data.rowCount > 0) {
            infoRolEmpleado = data.rows;
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo el rol del empleado, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo el rol del empleado, error: ${err}`,
        };
    });

    const obtenerAreaEmpleado = await pool.query(`
            SELECT a."nombreArea", ej."nombreEmpleado" AS jefeInmediato, ej."idEmpleado" AS idJefe
            FROM empleados AS e
                INNER JOIN areas AS a on a."idArea" = e."idArea"
                INNER JOIN empleados ej on ej."idEmpleado" = a."idJefeArea"
            WHERE e."idEmpleado" = $1;
        `, [idEmpleado]
    ).then(data => {
        if (data.rowCount > 0) {
            infoAreaEmpleado = data.rows;
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo el rol del empleado, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo el rol del empleado, error: ${err}`,
        };
    });

    let horaLogin = obtenerFechaHoraActual().split(" ")[1];
    let fechaLogin = obtenerFechaHoraActual().split(" ")[0];
    let queryLogin = `INSERT INTO sesiones ("idEmpleado", "fechaLogin", "horaLogin") VALUES (${idEmpleado}, '${fechaLogin}', '${horaLogin}')`;
    const guardarLogin = await pool.query(`
        ${queryLogin}
    `).then(data => {
        if (data.rowCount > 0) {
            guardoSesion = true
        };
    }).catch((err) => {
        console.log(`Ocurrió un error intentado guardar la sesión del empleado, error: ${err}`);
        errorCargue = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error intentado guardar la sesión del empleado, error: ${err}`,
        };
    }).finally(() => pool.end());

    delete empleadoSesion['password'];
    delete empleadoSesion['estadoEmpleados'];
    let objetoEmpleado = {
        "datosEmpleado": empleadoSesion,
        "datosRol": infoRolEmpleado,
        "datosArea": infoAreaEmpleado
    };

    return objetoEmpleado;
};

/**
 * Se actuliza la sesión del empleado con los datos a guardar de logout.
 * @param { number } idEmpleado Número de id en tabla sesiones
 * @returns { Promise<Object> } True para actualización, False para error
*/
const logOutEmpleado = async (idEmpleado) => {
    const pool = await getConnection();

    let respuesta;
    let horaLogout = obtenerFechaHoraActual().split(" ")[1];
    let fechaLogOut = obtenerFechaHoraActual().split(" ")[0];
    let idSesion;

    let queryEncontrar = `SELECT * FROM sesiones WHERE "idEmpleado" = ${idEmpleado} ORDER BY "idSesion" DESC LIMIT 1`;
    const encntrarSesion = await pool.query(`${queryEncontrar}`)
        .then(data => {
            if (data.rowCount > 0) {
                idSesion = data.rows[0].idSesion;
            };
        }).catch((err) => {
            console.log(`Ocurrió un error: ${err}`);
        });

    let queryLogout = `UPDATE sesiones SET "horaLogout" = '${horaLogout}', "fechaLogout" = '${fechaLogOut}' WHERE "idSesion" = ${idSesion};`;
    const guardarLogout = await pool.query(`${queryLogout}`)
        .then(data => {
            if (data.rowCount > 0) {
                respuesta = {
                    ok: true,
                    status_cod: 200,
                    data: `Se ha procesado la petición de base de datos con éxito, logout éxitoso.`,
                };
            };
        }).catch((err) => {
            console.log(`Ocurrió un error intentado hacer el logout del usuario, error: ${err}`);
            respuesta = {
                ok: false,
                status_cod: 500,
                data: `Ocurrió un error intentado hacer el logout del usuario, error: ${err}`,
            };
        }).finally(() => pool.end());

    return respuesta;
};

/**
 * Obtenemos los registros de la tabla Empleados, 
 * que tienen estado true.
 * @returns { Promise<Array> } Array de objetos con info de empleados
*/
const getAllUsersDatabase = async () => {
    const pool = await getConnection();

    let inforEmpleados = {};
    const consultarEmpleados = await pool.query(`
        SELECT * FROM empleados WHERE "estadoEmpleados" IS NOT false ORDER BY "idEmpleado" ASC;
    `).then(data => {
        inforEmpleados = {
            status_cod: 200,
            status: '200 Ok.',
            data: data.rows
        };
    }).catch((err) => {
        console.log(`Ocurrió un error obteniendo todos los empleados en base de datos, error: ${err}`);
        inforEmpleados = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error obteniendo todos los empleados en base de datos, error: ${err}`,
        };
    }).finally(() => pool.end());

    return inforEmpleados;
}

/**
 * Metodo pata actualización de registro en tabla "empleados"
 * @param { Object } empleado Objecto con información del empleado
 * @returns { Promise<Object> } Información exitosa o erronea del resultado de la base de datos
*/
const updateUserDatabase = async(empleado) => {

    console.log('Vino a la bd');
    const pool = await getConnection()
    let {
        nombreEmpleado,
        direccionEmpleado,
        telefonoEmpleado,
        correo,
        idEmpleado
    } = empleado;
    let respuesta;

    const consultarUsuario = await pool.query(`
            UPDATE empleados SET
                "nombreEmpleado" = $1, 
                "direccionEmpleado" = $2, 
                "telefonoEmpleado" = $3, 
                correo = $4 
            WHERE "idEmpleado" = $5;
    `, [nombreEmpleado, direccionEmpleado, telefonoEmpleado, correo, idEmpleado]
    ).then(data => {
        if (data.rowCount > 0) {
            respuesta = {
                ok: true,
                status_cod: 200,
                data: `El usuario ${nombreEmpleado} - ${idEmpleado}, se ha actualizado con éxito.`,
            };
        };
    }).catch((err) => {
        console.log(`Ocurrió un error en la petición de encontrar usuario, error: ${err}`);
        respuesta = {
            ok: false,
            status_cod: 500,
            data: `Ocurrió un error en la petición de encontrar usuario, error: ${err}`,
        };
    });

    return respuesta;
};

module.exports = {
    createUserEmpleados,
    createUserSession,
    createUserRol,
    createUserSalario,
    cambiarPassEmpleado,
    loginEmpleado,
    logOutEmpleado,
    createUserHorario,
    getAllUsersDatabase,
    updateUserDatabase
};
