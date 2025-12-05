const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const { webhookAuth } = require('../middleware/webhook-auth.middleware');

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: PhonePe webhook endpoint (SHA256 Authentication required)
 *     tags: [Payment]
 *     description: PhonePe sends payment status updates to this webhook endpoint. Uses SHA256 hash authentication where Authorization header contains SHA256(username:password). Processes payment verification for both completed and failed events.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: SHA256 hash of username:password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "checkout.order.completed"
 *               data:
 *                 type: object
 *                 properties:
 *                   transactionId:
 *                     type: string
 *                   merchantOrderId:
 *                     type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/', webhookAuth, webhookController.handleWebhook);

module.exports = router;

