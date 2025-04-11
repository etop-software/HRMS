const express = require('express');
const  dashboardController  = require('../controllers/dashboardController');

const router = express.Router();

// Route to fetch today's attendance summary
router.get('/attendance-summary', dashboardController.getTodayAttendanceSummary);
router.get('/punchIn-summary',dashboardController.getTop10AttendenceRecords)
router.get('/device-status', dashboardController.getDeviceStatus);

module.exports = router;
