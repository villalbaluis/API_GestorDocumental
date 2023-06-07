const { createUserEmpleados, createUserSession, createUserRol, createUserSalario, createUserHorario, cambiarPassEmpleado, loginEmpleado, logOutEmpleado, getAllUsersDatabase, updateUserDatabase } = require('../controllers/auth.controller');
const { consultaRoles, consultaHorarios } = require('../../utils/controllers/utils.controller');
const jwt = require('jsonwebtoken');
const config = require('../../../config.js');

/**
 * Metodo para la creación de usuario, para crear un usuario.
 * @param {*} req => (request) obtiene los datos de la petición enviados a través del body
 * @param {*} res => (response) entrega una respuesta al servicio que consume
*/
const createUser = async (req, res) => {
    // {
    //     "nombreEmpleado": STRING,
    //     "cedulaEmpleado": INT (Se convierte luego),
    //     "direccionEmpleado": STRING,
    //     "telefonoEmpleado": STRING,
    //     "fechaInicioLaboresEmpleado": STRING => Se copnvierte a date,
    //     "fechaFinContratoEmpleado": Puede ser null, recibe STRING, se convierte luego a date,
    //     "username": STRING,
    //     "password": STRING => La recibe como texto, la debe cifrar, y luego guardar,
    //     "correo": STRING,
    //     "numeroContrato": INT,
    //     "estadoEmpleado": BOOLEAN,
    //     "idRol": INT => referencia el rol del usuario, por defecto será 4
    //     "salarioBase": INT => Monto de pago sin puntos.
    //     "idHorario": INT => referencia al horario de la tabla horarios
    //     "idArea": INT => referencia al área de la tabla areas
    // }
    const data = req.body;
    let message, respuesta, idEmpleado, erroneos = [];
    const camposObligatorios = [
        { key: "nombreEmpleado", type: "string" },
        { key: "cedulaEmpleado", type: "number" },
        { key: "direccionEmpleado", type: "string" },
        { key: "telefonoEmpleado", type: "string" },
        { key: "fechaInicioLaboresEmpleado", type: "number" },
        { key: "username", type: "string" },
        { key: "password", type: "string" },
        { key: "correo", type: "string" },
        { key: "numeroContrato", type: "number" },
        { key: "estadoEmpleado", type: "boolean" },
        { key: "idRol", type: "number" },
        { key: "salarioBase", type: "number" },
        { key: "idHorario", type: "number" },
        { key: "idArea", type: "number" },
    ];

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(data)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    data.forEach((dato) => {
        const camposFaltantes = camposObligatorios.filter((campo) => {
            const key = typeof campo === "string" ? campo : campo.key;
            const type = typeof campo === "string" ? undefined : campo.type;
            if (!dato.hasOwnProperty(key) || dato[key] === "") {
                return true;
            };
            if (type && typeof dato[key] !== type) {
                return true;
            };
            return false;
        });
        erroneos.push(...camposFaltantes);
    });

    if (erroneos.length > 0) {
        let campo = '';
        for (const erroneo of erroneos) {
            let llave = erroneo.key
            let error = `${llave}, `;
            campo = campo + error
        };
        message = `La petición no ha podido ser procesada, no se obtuvieron los datos para: ${campo}`
        respuestaError.message = message;
        return res.json(respuestaError);
    }

    let guardarEmpleado, guardaRolEmpleado, guardarSalarioEmpleado, guardarHorarioEmpleado, errorLlamado;
    let errores = [];

    try {
        guardarEmpleado = await createUserEmpleados(data[0]);
    } catch (error) {
        errorLlamado = `Ocurrió un error insertando el empleado en la tabla Empleados, error: ${error}`
        errores.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (guardarEmpleado.status_cod == 500) {
        message = `La petición no ha podido ser procesada, ocurrió un error en la creación del usuario en base de datos, error: ${guardarEmpleado.data}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    idEmpleado = guardarEmpleado.idEmpleado;

    try {
        guardaRolEmpleado = await createUserRol(idEmpleado, data[0].idRol);
    } catch (error) {
        errorLlamado = `Ocurrió un error guardando el empleado por rol en base de datos, error: ${error}`
        errores.push(errorLlamado);
        console.log(errorLlamado);
    };

    try {
        guardarSalarioEmpleado = await createUserSalario(idEmpleado, data[0].salarioBase);
    } catch (error) {
        errorLlamado = `Ocurrió un error guardando el salario del empleado, error: ${error}`
        errores.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (guardarEmpleado.status_cod == 500 || guardaRolEmpleado.status_cod || guardarSalarioEmpleado.status_cod) {
        respuesta = {
            ok: false,
            status_cod: 206,
            status: '206. Partial Content',
            mensaje: `Ha ocurrido un error procesando la solicitud.`,
            error: `Guardar empleado: ${guardarEmpleado.status_cod}, Guardar rol: ${guardaRolEmpleado}, Guardar salario: ${guardarSalarioEmpleado}, Guardar horario: ${guardarHorarioEmpleado}`
        };
    } else {
        respuesta = {
            ok: true,
            status_cod: 200,
            status: '200. Ok',
            error: `La petición se ha procesado con éxito, se ha creado el empleado de cedula: ${data[0].cedulaEmpleado} con id: ${idEmpleado}.`
        };
    };

    return res.json(respuesta);

};

/**
 * Metodo mediante el cual se actualiza la contraseña del usuario.
 * (A futuro se debe añadir la feature de código por correo) 
 * @param { Object} req JSON con usuario o correo, y contraseña del empleado
 * @param { object } res JSON con respuesta erroneo o exitosa
*/
const changeUserPassword = async (req, res) => {
    const data = req.body;
    let message, errorLlamado, errores = [], respuesta, esCorreo = false;

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    let user = data.user;
    let pass = data.pass;

    if (!data.user || !data.pass) {
        message = 'No se han obtenido suficientes datos para continuar con el proceso.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (user.includes("@")) {
        esCorreo = true;
    };

    try {
        cambiarPassword = await cambiarPassEmpleado(user, pass, esCorreo);
    } catch (error) {
        errorLlamado = `Ocurrió un error actualizando la contraseña del empleado, error: ${error}`
        errores.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (errores.length > 0) {
        respuesta = {
            ok: false,
            status_cod: 500,
            status: '500. Server error',
            error: `No se ha podido procesar la petición solicitada, lo sentimos.`,
            error: errores
        };
    } else {
        respuesta = {
            ok: true,
            status_cod: 200,
            status: '200. Ok',
            error: `La petición se ha procesado con éxito, se ha modificado la contraseña para: ${user}.`
        };
    };

    return res.json(respuesta);
};

/**
 * Login del usuario, retornará un JWT con la info del empleado.
 * @param { Object} req JSON con username, y contraseña del empleado
 * @param { object } res JSON con JWT de datos del usuario.
*/
const loginUser = async (req, res) => {

    const { user, pass } = req.body;

    let message, errorLlamado, loginUsuario, errores = [], respuesta, esCorreo = false;

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };
    if (!user || !pass) {
        message = 'No se ha proporcionado el usuario o contraseña.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        loginUsuario = await loginEmpleado(user, pass);
    } catch (error) {
        errorLlamado = `Ocurrió un error intentando iniciar sesión, error: ${error}`
        errores.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (typeof (loginUsuario) == 'object') {
        const token = jwt.sign(
            loginUsuario,
            config.JWT_SECRETO,
            { expiresIn: config.JWT_TIEMPO_EXPIRA }
        );
        respuesta = {
            ok: true,
            status_cod: 200,
            // data: { token }
            data: loginUsuario
        };
    } else {
        respuesta = {
            ok: false,
            status_cod: 400,
            data: loginUsuario
        };
    };

    // return res.json(loginUsuario);
    return res.json(respuesta);
};

/**
 * Logout del usuario, para actualización fecha y hora de logout.
 * @param { Number} req idEmpleado que se va a actualizar en tabla sesiones
 * @param { object } res JSON con dato sobre transacción de logout.
*/
const logoutUser = async (req, res) => {
    let idEmpleado = req.body.idEmpleado;

    let message, respuesta;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (typeof (idEmpleado) != 'number' || !idEmpleado) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        respuesta = await logOutEmpleado(idEmpleado);
    } catch (error) {
        message = `Ocurrió un error en la petición de logout del usuario, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (!respuesta) {
        message = `No se ha procesado la petición de logout.`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    } else {
        return res.json(respuesta);
    };
};

/**
 * Metodo mediante el cual obtendremos todos los usuarios
 * en base de datos.
 * @param {*} req ?? ¡No se usará en esta expresión!
 * @param { Promise<Array> } res Array de objetos con todos los usuarios.
*/
const allUsers = async (req, res) => {

    let respuesta, message;

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };
    try {
        respuesta = await getAllUsersDatabase();
    } catch (error) {
        message = `Ocurrió un error generando la petición para consulta de todos los usuarios, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    for (const empleado of respuesta.data) {
        delete empleado["password"]
        delete empleado["estadoEmpleados"]
    };

    return res.json(respuesta);
};

/**
 * Metodo para actualización de datos del empleado
 * @param { Array } req Array de objeto único
 * @param { Object } res con información del proceso 
 * @returns res 
*/
const updateUser = async (req, res) => {
    let datosRecibidos = req.body;
    let message, respuesta, errorLlamado, erroneos = [];
    const camposObligatorios = [
        { key: "nombreEmpleado", type: "string" },
        { key: "direccionEmpleado", type: "string" },
        { key: "telefonoEmpleado", type: "string" },
        { key: "correo", type: "string" },
        { key: "idEmpleado", type: "number" }
    ];

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    let dataUpdateUser = [];
    dataUpdateUser.push(datosRecibidos)
    
    if (!Array.isArray(dataUpdateUser)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataUpdateUser.forEach((dato) => {
        const camposFaltantes = camposObligatorios.filter((campo) => {
            const key = typeof campo === "string" ? campo : campo.key;
            const type = typeof campo === "string" ? undefined : campo.type;
            if (!dato.hasOwnProperty(key) || dato[key] === "") {
                return true;
            };
            if (type && typeof dato[key] !== type) {
                return true;
            };
            return false;
        });
        erroneos.push(...camposFaltantes);
    });

    if (erroneos.length > 0) {
        let campo = '';
        for (const erroneo of erroneos) {
            let llave = erroneo.key
            let error = `${llave}, `;
            campo = campo + error
        };
        message = `La petición no ha podido ser procesada, no se obtuvieron los datos para: ${campo}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        respuesta = await updateUserDatabase(dataUpdateUser[0]);
    } catch (error) {
        errorLlamado = `Ocurrió un error actualizando el empleado en la tabla Empleados, error: ${error}`
        erroneos.push(errorLlamado);
    };

    console.log(respuesta);
    if (erroneos.length > 0) {
        message = `La petición no ha podido ser procesada, error: ${erroneos.join(", ")}`
        respuestaError.message = message;
        return res.json(respuestaError);
    } else {
        return res.json(respuesta);
    }

};

module.exports = {
    createUser,
    changeUserPassword,
    loginUser,
    logoutUser,
    allUsers,
    updateUser
};
