const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const authController = require('../controllers/authController');

router.get('/signup', authController.signupForm);
router.post('/signup', upload.single('pet_image'), authController.signup);

router.get('/login', authController.loginForm);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;
