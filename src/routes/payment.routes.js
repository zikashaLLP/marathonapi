const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { createPaymentValidator } = require('../validators/payment.validator');
const { validate } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create payment order for one or multiple participants (No authentication required)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *               - totalAmount
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of participant IDs (for single participant, pass array with one element)
 *                 example: [1, 2, 3]
 *               totalAmount:
 *                 type: number
 *                 description: Total amount for all participants
 *                 example: 500.00
 *     responses:
 *       200:
 *         description: Payment order created successfully
 */
router.post(
  '/create',
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

