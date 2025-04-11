// routes/attendanceRoutes.js
const express = require('express');
const { recordAttendance } = require('../controllers/attendanceController');
const { getAttendance,processAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', recordAttendance);
router.get('/', getAttendance);
router.post('/process', processAttendance);

module.exports = router;
