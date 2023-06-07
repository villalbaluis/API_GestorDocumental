const { crearTareaBaseDatos, updateTareaBaseDatos, deleteTareaBaseDatos, showTareasBaseDatos, getTareaBaseDatos, assignTarEmp, assignTarObj, crearEvidenciaTareaBaseDatos, updateTareaXEmpleado } = require('../controllers/tareas.controller');

/**
 * Metodo para recibir datos de la tarea para gestionar validaciones.
 * @param { Array } req Arreglo con objeto para creación de la tarea 
 * @param { Object } res Respuesta en JSON para cliente
 * @returns res
*/
const createTarea = async (req, res) => {

    const dataTareas = req.body;

    let message, infoMetodo, erroneos = [];
    const camposObligatorios = [
        { key: "idEstado", type: "number" },
        { key: "nombreTarea", type: "string" },
        { key: "descripcionTarea", type: "string" },
        { key: "fechaInicioTarea", type: "number" },
        { key: "fechaFinTarea", type: "number" },
        { key: "duracion", type: "number" },
        { key: "dificultad", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataTareas)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataTareas.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        infoMetodo = await crearTareaBaseDatos(dataTareas[0]);
    } catch (error) {
        message = `Ha ocurrido un error en la petición de la base de datos, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };
    if (infoMetodo) {
        return res.json(infoMetodo);
    };
};

/**
 * Se actualizará la tarea, con los mismos datos, o nuevos,
 * validados a través del ID de la tarea enviado en la petición
 * @param { Array } req Array de objetos con información e id de la tarea actualizar 
 * @param { Object } res JSON con respuesta exitosa o erronea
 * @returns res
*/
const updateTarea = async (req, res) => {
    const dataTareas = req.body;

    let message, infoMetodo, erroneos = [];
    const camposObligatorios = [
        { key: "idEstado", type: "number" },
        { key: "nombreTarea", type: "string" },
        { key: "descripcionTarea", type: "string" },
        { key: "fechaInicioTarea", type: "number" },
        { key: "fechaFinTarea", type: "number" },
        { key: "duracion", type: "number" },
        { key: "dificultad", type: "number" },
        { key: "estadoTareas", type: "boolean" },
        { key: "idTarea", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataTareas)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataTareas.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        infoMetodo = await updateTareaBaseDatos(dataTareas[0]);
    } catch (error) {
        message = `Ha ocurrido un error en la petición de la base de datos, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };
    if (infoMetodo) {
        return res.json(infoMetodo);
    };
};

/**
 * Metodo para eliminación de la tarea a través del 
 * id que debe llegar en la petición.
 * @param { Number } req Id de la tarea
 * @param { Object } res JSON con respuesta exitosa o erronea
 * @returns res
*/
const deleteTarea = async (req, res) => {
    const idTarea = req.body[0].idTarea;
    let message, respuesta;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (typeof (idTarea) != 'number' || !idTarea) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        respuesta = await deleteTareaBaseDatos(idTarea);
    } catch (error) {
        message = `Ocurrió un error en la petición de eliminar la tarea en base de datos, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    } else {
        return res.json(respuesta);
    }
};

/**
 * Metodo para obtención de todos los objetivos en 
 * base de datos
 * @param { Object } res JSON con respuesta de datos encontrados
 * @returns res
*/
const getAllTareas = async (req, res) => {
    let respuesta, message;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    try {
        respuesta = await showTareasBaseDatos();
    } catch (error) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
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
 * Metodo para obtención una tarea en particular
 * @param { Number } req Id de la tarea
 * @param { Object } res JSON con respuesta de datos encontrados
 * @returns res
*/
const getTarea = async (req, res) => {

    let idTarea = req.body.taskId;
    idTarea = parseInt(idTarea);

    let message, respuesta;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (typeof (idTarea) != 'number' || !idTarea) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        respuesta = await getTareaBaseDatos(idTarea);
    } catch (error) {
        message = `Ocurrió un error en la petición de eliminar la tarea en base de datos, error: ${error}`;
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
 * Metodo para asignarle una tarea especifica a un empleado especifico
 * @param { Array } req Array de objeto con id respectivos 
 * @param {*} res Object de respuesta según proceso
 */
const asignarTareaEmpleado = async (req, res) => {

    const dataTarEmp = req.body;
    let message, respuesta, erroneos = [];
    const camposObligatorios = [
        { key: "idTarea", type: "number" },
        { key: "idEmpleado", type: "number" },
        { key: "avanceEmpleado", type: "number" },
        { key: "avanceJefe", type: "number" },
        { key: "aprobada", type: "boolean" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataTarEmp)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataTarEmp.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        respuesta = await assignTarEmp(dataTarEmp[0]);
    } catch (error) {
        message = `No se ha podido procesar la petición en la base de datos, error: ${error}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    return res.json(respuesta);
};

/**
 * Metodo para asignarle una tarea especifica a un objetivo especifico
 * @param { Array } req Array de objeto con id respectivos 
 * @param {*} res Object de respuesta según proceso
 */
const asignarTareaObjetivo = async (req, res) => {

    const dataTarObj = req.body;
    let message, respuesta, erroneos = [];
    const camposObligatorios = [
        { key: "idTarea", type: "number" },
        { key: "idObjetivo", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataTarObj)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataTarObj.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        respuesta = await assignTarObj(dataTarObj[0]);
    } catch (error) {
        message = `No se ha podido procesar la petición en la base de datos, error: ${error}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    return res.json(respuesta);
};

/**
 * Metodo para crear la evidencia de una tarea en especifico.
 * @param { Array } req Array de objeto con información de la evidencia
 * @param {*} res Object de respuesta según proceso
 */
const crearEvidenciaTarea = async (req, res) => {

    const dataEvidencia = req.body;
    let message, respuesta, erroneos = [];
    const camposObligatorios = [
        { key: "idTarea", type: "number" },
        { key: "nombreArchivo", type: "string" },
        { key: "rutaArchivo", type: "string" },
        { key: "idEmpleado", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataEvidencia)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataEvidencia.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    try {
        respuesta = await crearEvidenciaTareaBaseDatos(dataEvidencia[0]);
    } catch (error) {
        message = `No se ha podido procesar la petición en la base de datos, error: ${error}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    return res.json(respuesta);
};

/**
 * Endpoint para actualizar una tarea con relación a empleado
 * @param { Array } req Array de objeto único, con info de la tarea.
 * @param { Object } res Objeto con información de la operación en base de datos
 * @returns res
*/
const actualizarTareaXEmpleado = async (req, res) => {
    const dataTareaXEmpleado = req.body;

    let message, infoMetodo, erroneos = [];
    const camposObligatorios = [
        { key: "idTarea", type: "number" },
        { key: "idEmpleado", type: "number" },
        { key: "avanceEmpleado", type: "number" },
        { key: "avanceJefe", type: "number" },
        { key: "idTareaXEmpleado", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataTareaXEmpleado)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataTareaXEmpleado.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, los datos son erroneos para los campos: ${campo}`
        respuestaError.message = message;
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        infoMetodo = await updateTareaXEmpleado(dataTareaXEmpleado[0]);
    } catch (error) {
        message = `Ha ocurrido un error en la petición de la base de datos, error: ${error}`;
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };
    if (infoMetodo) {
        return res.json(infoMetodo);
    };
};

module.exports = {
    createTarea,
    updateTarea,
    deleteTarea,
    getAllTareas,
    getTarea,
    asignarTareaEmpleado,
    asignarTareaObjetivo,
    crearEvidenciaTarea,
    actualizarTareaXEmpleado
};