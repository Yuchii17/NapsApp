const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

router.post('/forgot-password/request-otp', authController.forgotPasswordRequestOtp);
router.post('/forgot-password/reset', authController.resetPasswordWithOtp);

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
