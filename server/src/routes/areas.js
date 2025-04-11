// routes/areaRoutes.js
const express = require('express');
const areaController = require('../controllers/areaController');
const router = express.Router();

router.post('/', areaController.createArea);       // CREATE
router.get('/', areaController.getAllAreas);       // READ all
router.get('/:id', areaController.getAreaById);   // READ one
router.put('/:id', areaController.updateArea);    // UPDATE
router.delete('/:id', areaController.deleteArea); // DELETE

module.exports = router;
