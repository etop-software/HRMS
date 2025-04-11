const express = require('express');
const router = express.Router();
const employeeLeaveController = require('../controllers/EmployeeLeaveController');

// Route to assign a new leave to an employee
router.post('/', employeeLeaveController.assignLeaveToEmployees);

// Route to get all leaves assigned to a specific employee by employee ID
router.get('/:id', employeeLeaveController.getLeavesForEmployee);

router.get('/employee/all', employeeLeaveController.getAllEmployeesWithLeaves);

router.get('/Leaves/all', employeeLeaveController.getEmployeesWithLeaves);

// Route to update the status of a specific leave by leave ID
router.patch('/:id', employeeLeaveController.updateLeaveStatus);

// Route to delete a leave assignment by leave ID
router.delete('/:id', employeeLeaveController.deleteLeave);

router.put('/leave-assignments/:assignmentId', employeeLeaveController.updateLeaveAssignment);

router.delete('/leave-assignments/:assignmentId', employeeLeaveController.deleteLeaveAssignment);

router.get('/employee-leaves/:leaveId', employeeLeaveController.getLeaveById);

module.exports = router;
