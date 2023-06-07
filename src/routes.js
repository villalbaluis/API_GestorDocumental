const Router = require('express');

/**
 * Importación de archivos contenedores de 
 * rutas de la aplicación
*/
const authRoutes = require('./modules/auth/routes/auth.routes');
const objetivoRoutes = require('./modules/objetivos/routes/objetivo.routes');
const areaRoutes = require('./modules/areas/routes/areas.routes');
const tareasRoutes = require('./modules/tareas/routes/tareas.routes');

const router = Router();

// Status api endpoint
router.get('/api-status', (req, res) => {
    return res.send({ 'Status': 'Online' });
});

/**
 * Se usan las rutas encontradas en los modulos importados de rutas
*/
router.use(authRoutes);
router.use(objetivoRoutes);
router.use(areaRoutes);
router.use(tareasRoutes);


module.exports = router;
