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

/**
 * @swagger
 * /api/admin/participants-with-payment:
 *   get:
 *     summary: Get participants with payment details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [all, Completed]
 *           default: all
 *         description: Filter by payment status. 'all' returns all participants, 'Completed' returns only paid participants
 *     responses:
 *       200:
 *         description: List of participants with payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Sr.No:
 *                         type: integer
 *                       Name:
 *                         type: string
 *                       Email:
 *                         type: string
 *                       Mobile No:
 *                         type: string
 *                       Gender:
 *                         type: string
 *                       City:
 *                         type: string
 *                       Pincode:
 *                         type: string
 *                       T-shirt Size:
 *                         type: string
 *                       Birth Date:
 *                         type: string
 *                         format: date
 *                       Payment Status:
 *                         type: string
 *                       Payment Date:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 count:
 *                   type: integer
 *       400:
 *         description: Invalid paymentStatus parameter
 */
router.get('/participants-with-payment', isAdmin, adminController.getParticipantsWithPaymentDetails);

/**
 * @swagger
 * /api/admin/participants-statistics:
 *   get:
 *     summary: Get participant statistics grouped by gender and age (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participant statistics grouped by gender and age
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     Women:
 *                       type: object
 *                       properties:
 *                         groupName:
 *                           type: string
 *                         participantCount:
 *                           type: integer
 *                         tshirtSizes:
 *                           type: object
 *                           properties:
 *                             XS 34:
 *                               type: integer
 *                             S 36:
 *                               type: integer
 *                             M 38:
 *                               type: integer
 *                             L 40:
 *                               type: integer
 *                             XL 42:
 *                               type: integer
 *                             XXL 44:
 *                               type: integer
 *                             3XL 46:
 *                               type: integer
 *                     Men Group A - Age upto 30:
 *                       type: object
 *                     Men Group B - Age 31 to 45:
 *                       type: object
 *                     Men Group C - Age above 45:
 *                       type: object
 */
router.get('/participants-statistics', isAdmin, adminController.getParticipantStatisticsByGroup);

module.exports = router;

