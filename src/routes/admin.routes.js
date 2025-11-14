const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/rbac.middleware');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: mobileNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', authenticate, isAdmin, adminController.getAllUsers);

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
 *           enum: [XS, S, M, L, XL, XXL]
 *       - in: query
 *         name: marathonName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of participants
 */
router.get('/participants', authenticate, isAdmin, adminController.getMarathonParticipants);

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
router.get('/reports/tshirt-size', authenticate, isAdmin, adminController.getTshirtSizeReport);

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
router.get('/reports/payment-statistics', authenticate, isAdmin, adminController.getPaymentStatistics);

module.exports = router;

