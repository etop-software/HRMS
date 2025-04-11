const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Define routes
router.post('/', departmentController.createDepartment);      
router.get('/', departmentController.getDepartments);         
router.get('/:id', departmentController.getDepartmentById); 
router.put('/:id', departmentController.updateDepartment);      
router.delete('/:id', departmentController.deleteDepartment);   

module.exports = router;