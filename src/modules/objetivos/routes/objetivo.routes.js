const { Router } = require('express');
const router = Router();

const { createObjetivo, updateObjetivo, deleteObjetivo, getAllObjetivos, asignarObjetivoArea } = require('../api/objetivo.api');

// Rutas para el manejo del CRUD de objetivos
router.post('/objetivos/create/objetivo', createObjetivo);
router.put('/objetivos/update/objetivo', updateObjetivo);
router.delete('/objetivos/delete/objetivo', deleteObjetivo);
router.get('/objetivos/show', getAllObjetivos);

// Rutas de asignación de objetivo con areas
router.post('/objetivos/assign/area', asignarObjetivoArea);

module.exports = router;
