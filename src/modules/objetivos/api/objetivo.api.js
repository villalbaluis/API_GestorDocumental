const { crearObjetivoBaseDatos, updateObjetivoBaseDatos, deleteObjetivoBaseDatos, showObjetivosBaseDatos, assignObjeArea } = require('../controllers/objetivo.controller');

/**
 * Metodo para creación de objetivo.
 * @param { Array } req Arreglo con objeto para creación de objetivo 
 * @param { Object } res Respuesta en JSON para cliente
 * @returns res
*/
const createObjetivo = async (req, res) => {

    const dataObjetivo = req.body;

    let message, infoMetodo, erroneos = [];
    const camposObligatorios = [
        "nombreObjetivo",
        "descripcionObjetivo",
        "fechaInicioObjetivo",
        "fechaFinObjetivo"
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataObjetivo)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataObjetivo.forEach((dato) => {
        const camposFaltantes = camposObligatorios.filter((key) => !dato.hasOwnProperty(key) || dato[key] == "");
        erroneos.push(...camposFaltantes);
    });

    if (erroneos.length > 0) {
        message = `La petición no ha podido ser procesada, no se obtuvieron los datos para: ${erroneos.join(", ")}`
        respuestaError.message = message;
    }

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        infoMetodo = await crearObjetivoBaseDatos(dataObjetivo[0]);
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
 * Se actualizará el objetivo, con los mismos datos, o nuevos,
 * validados a través del ID del objetivo enviado en la petición
 * @param { Array } req Array de objetos con información e id del objetivo actualizar 
 * @param { Object } res JSON con respuesta exitosa o erronea
 * @returns res
*/
const updateObjetivo = async (req, res) => {
    const updateData = req.body;

    let message, infoMetodo, erroneos = [];
    const camposObligatorios = [
        { key: "nombreObjetivo", type: "string" },
        { key: "descripcionObjetivo", type: "string" },
        { key: "fechaInicioObjetivo", type: "number" },
        { key: "fechaFinObjetivo", type: "number" },
        { key: "idObjetivo", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(updateData)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    updateData.forEach((dato) => {
        const camposFaltantes = camposObligatorios.filter((campo) => {
            const key = typeof campo === "string" ? campo : campo.key;
            const type = typeof campo === "string" ? undefined : campo.type;

            if (!dato.hasOwnProperty(key) || dato[key] === "") {
                return true;
            }

            if (type && typeof dato[key] !== type) {
                return true;
            }

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
        infoMetodo = await updateObjetivoBaseDatos(updateData[0]);
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
 * Metodo para eliminación del objetivo a través del 
 * id que debe llegar en la petición.
 * @param { Number } req Id del objetivo
 * @param { Object } res JSON con respuesta exitosa o erronea
 * @returns res
*/
const deleteObjetivo = async (req, res) => {
    const idObjetivo = req.body[0].idObjetivo;
    let message, respuesta;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (typeof (idObjetivo) != 'number' || !idObjetivo) {
        message = 'El dato proporcionado no es valido, por favor, verifiqué la información ingresada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    if (respuestaError.message) {
        return res.json(respuestaError);
    };

    try {
        respuesta = await deleteObjetivoBaseDatos(idObjetivo);
    } catch (error) {
        message = `Ocurrió un error en la petición de eliminar el objetivo en base de datos, error: ${error}`;
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
const getAllObjetivos = async (req, res) => {
    let respuesta, message;
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    try {
        respuesta = await showObjetivosBaseDatos();
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
 * Metodo para asignarle una tarea especifica a un empleado especifico
 * @param { Array } req Array de objeto con id respectivos 
 * @param {*} res Object de respuesta según proceso
 */
const asignarObjetivoArea = async (req, res) => {

    const dataobjArea = req.body;
    let message, respuesta, erroneos = [];
    const camposObligatorios = [
        { key: "idObjetivo", type: "number" },
        { key: "idArea", type: "number" }
    ];
    let respuestaError = {
        statusCod: 400,
        status: "400. Bad Request.",
        message: message
    };

    if (!Array.isArray(dataobjArea)) {
        message = 'No se recibió un array de objetos desde la petición, por ende no será procesada.';
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    dataobjArea.forEach((dato) => {
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
        respuesta = await assignObjeArea(dataobjArea[0]);
    } catch (error) {
        message = `No se ha podido procesar la petición en la base de datos, error: ${error}`
        respuestaError.message = message;
        return res.json(respuestaError);
    };

    return res.json(respuesta);
};

module.exports = {
    createObjetivo,
    updateObjetivo,
    deleteObjetivo,
    getAllObjetivos,
    asignarObjetivoArea
};
