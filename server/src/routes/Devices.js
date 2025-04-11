// routes/deviceRoutes.js
const express = require('express');
const deviceController = require('../controllers/DeviceController');
const router = express.Router();

// Route to fetch device info by serial number
router.get('/:serial_number', deviceController.getDeviceBySerialNumber);
router.put('/:serial_number', deviceController.updateDevice);
router.get('/', deviceController.getAllDevices);
router.delete('/:serial_number', deviceController.deleteDevice); 



module.exports = router;
