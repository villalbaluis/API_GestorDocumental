const { Router } = require('express');
const router = Router();

const { createTarea, updateTarea, deleteTarea, getAllTareas, asignarTareaEmpleado, asignarTareaObjetivo, crearEvidenciaTarea, getTarea, actualizarTareaXEmpleado } = require('../api/tareas.api');

// Rutas para manejo de CRUD de tareas
router.post('/tareas/create/tarea', createTarea);
router.put('/tareas/update/tarea', updateTarea);
router.delete('/tareas/delete/tarea', deleteTarea);
router.get('/tareas/show', getAllTareas);
router.post('/tareas/show/tarea', getTarea);

// Rutas para asignación de tareas
router.post('/tareas/assign/tarea', asignarTareaEmpleado);
router.post('/tareas/assign/objetivo', asignarTareaObjetivo);
router.post('/tareas/evidencias/create', crearEvidenciaTarea);

// Rutas para actualización de tareas
router.post('/tareas/update/tareaxempleado', actualizarTareaXEmpleado);

module.exports = router;
