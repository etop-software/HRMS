const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Define routes
router.post('/', employeeController.createEmployee);      
router.get('/', employeeController.getEmployees);         
router.get('/:id', employeeController.getEmployeeById); 
router.put('/:id', employeeController.updateEmployee);      
router.delete('/:id', employeeController.deleteEmployee);  
router.get('/search/:employeeId', employeeController.getEmployeeByParam);
router.get('/Dropdown/values',employeeController.getEmployeesforDropdown)
router.get('/employeesareas/:employee_id', employeeController.getEmployeeAreas); 
router.get('/searchEmployesByArea/:areaid',employeeController.getEmployeesbyAreaidDropdown)


module.exports = router;
