const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

// Routes without /designations prefix
router.post('/', designationController.createDesignation);
router.get('/', designationController.getDesignations);
router.get('/:id', designationController.getDesignationById);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);

module.exports = router;
