const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');


router.post('/', companyController.createCompany);

router.get('/', companyController.getCompanies);

router.get('/:id', companyController.getCompanyById);


router.put('/:id', companyController.updateCompany);

// Delete a company by ID
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
