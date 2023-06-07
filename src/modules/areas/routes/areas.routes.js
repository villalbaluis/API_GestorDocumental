const { Router } = require('express');
const router = Router();

const { createArea, updateArea, deleteArea, getAllAreas} = require('../api/areas.api');

router.post('/areas/create/area', createArea);
router.put('/areas/update/area', updateArea);
router.delete('/areas/delete/area', deleteArea);
router.get('/areas/show', getAllAreas);

module.exports = router;
