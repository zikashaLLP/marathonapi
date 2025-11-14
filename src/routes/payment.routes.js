const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { createPaymentValidator, paymentStatusValidator } = require('../validators/payment.validator');
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
 * /api/payment/callback:
 *   post:
 *     summary: Payment callback from PhonePe
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               response:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect to success/failure page
 */
router.post('/callback', paymentController.paymentCallback);

/**
 * @swagger
 * /api/payment/status/{orderId}:
 *   get:
 *     summary: Get payment status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 */
router.get(
  '/status/:orderId',
  authenticate,
  paymentStatusValidator,
  validate,
  paymentController.getPaymentStatus
);

module.exports = router;

