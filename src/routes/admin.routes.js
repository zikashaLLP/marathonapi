const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middleware/rbac.middleware');

/**
 * @swagger
 * /api/admin/participants:
 *   get:
 *     summary: Get marathon participants with filters (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marathonId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: marathonType
 *         schema:
 *           type: string
 *           enum: [Open, Defence]
 *       - in: query
 *         name: isPaymentCompleted
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: tshirtSize
 *         schema:
 *           type: string
 *           enum: [XS 34, S 36, M 38, L 40, XL 42, XXL 44, 3XL 46]
 *       - in: query
 *         name: marathonName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of participants
 */
router.get('/participants', isAdmin, adminController.getMarathonParticipants);

/**
 * @swagger
 * /api/admin/reports/tshirt-size:
 *   get:
 *     summary: Get T-shirt size count report (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marathonId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: T-shirt size report
 */
router.get('/reports/tshirt-size', isAdmin, adminController.getTshirtSizeReport);

/**
 * @swagger
 * /api/admin/reports/payment-statistics:
 *   get:
 *     summary: Get payment statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marathonId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment statistics
 */
router.get('/reports/payment-statistics', isAdmin, adminController.getPaymentStatistics);

module.exports = router;

