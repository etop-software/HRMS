const express = require('express');
const router = express.Router();
const attendanceController = require('./../controllers/manualPunch.js');

router.get('/', attendanceController.getAttendance);
// Add attendance record
router.post('/', attendanceController.addAttendance);

router.get('/:id', attendanceController.getAttendanceById);

// Update punch-in and punch-out times
router.put('/:id', attendanceController.updatePunchTimes);

router.delete('/:id', attendanceController.deletePunch);   


module.exports = router;
