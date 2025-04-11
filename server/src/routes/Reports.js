const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');


router.get('/attendance-report', ReportController.getEmployeeAttendanceReport);
router.get('/Absent-report', ReportController.getEmployeeAbsentReport);
router.get('/Late-report', ReportController.getEmployeeLateReport);
router.get('/OverTime-report', ReportController.getEmployeeOverTimeReport);
router.get('/Transaction-report', ReportController.getEmployeeTransactionReport);
router.get('/Punchin-Punchout-report', ReportController.PunchinPunchoutReport);
router.get('/Pattendance-report', ReportController.pattendanceReport);
router.get('/Early-leave-report', ReportController.getEmployeeEarlyLeaveReport);

router.get('/finalreport',ReportController.ReportFinal);
router.get('/LenadorReport',ReportController.getEmployeeReportLenador);
router.get('/Daily-Attendance-Report',ReportController.getAttendanceSummaryDaily);
router.get('/First-In-Last-Out-Report',ReportController.getEmployeeFirstInLastOutReport);



module.exports = router;
