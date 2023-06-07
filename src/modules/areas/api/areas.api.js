const { crearAreaTrabajo, updateAreaTrabajo, deleteAreaBaseDatos, showAreasBaseDatos } = require('../controllers/areas.controller');
const { consultaEstadosTareas } = require('../../utils/controllers/utils.controller');

/**
 * Metodo para creación de area de trabajo.
 * @param {*} req => (request) obtiene los datos de la petición enviados a través del body
 * @param {*} res => (response) entrega una respuesta al servicio que consume
*/
const createArea = async (req, res) => {
    const datosAreas= req.body;
    let message, erroneos = [];
    const camposObligatorios = [
        "nombreArea",
        "descripcionArea",
        "fechaInicioArea",
        "idJefeArea",
        "idGerenteArea"
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(datosAreas)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    datosAreas.forEach((dato) => {
        const camposFaltantes = camposObligatorios.filter((key) => !dato.hasOwnProperty(key) || dato[key] == "");
        erroneos.push(...camposFaltantes);
    });

    if (erroneos.length > 0) {
        message = `La petición no ha podido ser procesada, no se obtuvieron los datos para: ${erroneos.join(", ")}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    let infoMetodo;
    try {
        infoMetodo = await crearAreaTrabajo(datosAreas[0]);
    } catch (error) {
        errorLlamado = `Ocurrió un error ejecutando la acción de guardar el AREA DE TRABAJO, error: ${error}`
        erroneos.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    } else {
        return res.json(infoMetodo);
    };

};

/**
 * Metodo para actualización de un area de trabajo especifica.
 * @param { Array } req => (request) obtiene los datos de la petición enviados a través del body
 * @param { Object } res => (response) entrega una respuesta al servicio que consume
*/
const updateArea = async (req, res) => {

    const datosAreas= req.body;

    let message, erroneos = [];

    const camposObligatorios = [
        { key: "nombreArea", type: "string" },
        { key: "descripcionArea", type: "string" },
        { key: "fechaInicioArea", type: "number" },
        { key: "estadoArea", type: "boolean" },
        { key: "idArea", type: "number" }
    ];

    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(datosAreas)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    datosAreas.forEach((dato) => {
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
        message = `La petición no ha podido ser procesada, no se obtuvieron los datos para: ${erroneos.join(", ")}`
        respuestaError.message = message;
    }

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    let infoMetodo;
    try {
        infoMetodo = await updateAreaTrabajo(datosAreas[0]);
    } catch (error) {
        errorLlamado = `Ocurrió un error ejecutando la acción de guardar el AREA DE TRABAJO, error: ${error}`
        erroneos.push(errorLlamado);
        console.log(errorLlamado);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    } else {
        return res.json(infoMetodo);
    };

};

/**
 * Metodo para eliminación del area a través del 
 * id que debe llegar en la petición.
 * @param { Number } req Id del area
 * @param { Object } res JSON con respuesta exitosa o erronea
 * @returns res
*/
const deleteArea = async (req, res) => {
    const idArea = req.body[0].idArea;
    let message, respuesta;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (typeof (idArea) != 'number' || !idArea) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        respuesta = await deleteAreaBaseDatos(idArea);
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
 * Metodo para obtención de todas las tareas en base de datos.
 * @param { Object } res JSON con respuesta de datos encontrados
 * @returns res
*/
const getAllAreas = async (req, res) => {
    let respuesta, message;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    try {
        respuesta = await showAreasBaseDatos();
    } catch (error) {
        message = 'Ha ocurrido un error en la consulta de areas a la base de datos.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    } else {
        return res.json(respuesta);
    };

};

module.exports = {
    createArea,
    updateArea,
    deleteArea,
    getAllAreas
};
