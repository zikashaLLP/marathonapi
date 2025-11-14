const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { sendOTPValidator, verifyOTPValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to mobile number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', sendOTPValidator, validate, authController.sendOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - otp
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', verifyOTPValidator, validate, authController.verifyOTP);

module.exports = router;

