const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { adminLoginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - password
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/admin/login', adminLoginValidator, validate, authController.adminLogin);

module.exports = router;

