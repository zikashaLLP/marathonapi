const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { createPaymentValidator } = require('../validators/payment.validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create payment order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *               - amount
 *             properties:
 *               participantId:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment order created successfully
 */
router.post(
  '/create',
  authenticate,
  createPaymentValidator,
  validate,
  paymentController.createPayment
);

/**
 * @swagger
 * /api/payment/verify:
 *   get:
 *     summary: Verify payment (PhonePe redirect endpoint)
 *     tags: [Payment]
 *     description: PhonePe redirects user here after payment. This endpoint verifies payment status, updates database, and redirects to frontend.
 *     parameters:
 *       - in: query
 *         name: merchantOrderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend success/failure page
 *       400:
 *         description: Missing merchantOrderId
 */
router.get('/verify', paymentController.verifyPayment);

module.exports = router;

