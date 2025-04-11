const express = require('express');
const router = express.Router();
const hrController = require('../controllers/gptController'); // Adjust the path as necessary

router.post('/ask-hr', hrController.askHR);

module.exports = router;