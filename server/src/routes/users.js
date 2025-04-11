const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/register', userController.registerUser);

router.get('/users', userController.getAllUsers);

router.post('/login', userController.loginUser);

router.put('/update', userController.updateUser);

router.post('/change-password', userController.changePassword);

router.delete('/:id', userController.deleteUser);

module.exports = router;
