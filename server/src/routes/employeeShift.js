const express = require('express');
const router = express.Router();
const employeeShiftController = require('../controllers/EmployeeShiftController');


router.post('/', employeeShiftController.assignShiftToEmployee);

//router.get('/:id', employeeShiftController.getCurrentShiftForEmployee);

router.get('/history/:id', employeeShiftController.getShiftHistoryForEmployee);

router.get('/all/employees', employeeShiftController.getAllEmployeesWithShifts);

// Route to get all shifts (for all employees)
router.get('/', employeeShiftController.getAllEmployeeShifts);

// Route to get all employees assigned to a specific shift
router.get('/shift/:shiftId', employeeShiftController.getEmployeesByShift);

router.get('/shifts', employeeShiftController.getShiftsbyemployeid);

module.exports = router;
