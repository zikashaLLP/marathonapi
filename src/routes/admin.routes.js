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
 *     summary: Get participant details filtered by gender and age range (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female, All]
 *           default: All
 *         description: Filter by gender. 'All' includes Male, Female, and Other
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *         description: Minimum age (inclusive)
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *         description: Maximum age (inclusive)
 *     responses:
 *       200:
 *         description: List of participants filtered by gender and age range
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
 *                       BIB Number:
 *                         type: string
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
 *         description: Invalid query parameters
 */
router.get('/participants-statistics', isAdmin, adminController.getParticipantStatisticsByGroup);

/**
 * @swagger
 * /api/admin/reports/participant-statistics:
 *   get:
 *     summary: Get participant statistics report grouped by gender and age with t-shirt size breakdown (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participant statistics grouped by gender and age with t-shirt size breakdown
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
 *                           example: "Women"
 *                         participantCount:
 *                           type: integer
 *                           example: 200
 *                         tshirtSizes:
 *                           type: object
 *                           properties:
 *                             XS 34:
 *                               type: integer
 *                               example: 10
 *                             S 36:
 *                               type: integer
 *                               example: 20
 *                             M 38:
 *                               type: integer
 *                               example: 40
 *                             L 40:
 *                               type: integer
 *                               example: 50
 *                             XL 42:
 *                               type: integer
 *                               example: 40
 *                             XXL 44:
 *                               type: integer
 *                               example: 0
 *                             3XL 46:
 *                               type: integer
 *                               example: 0
 *                     Men Group A - Age upto 30:
 *                       type: object
 *                       properties:
 *                         groupName:
 *                           type: string
 *                         participantCount:
 *                           type: integer
 *                         tshirtSizes:
 *                           type: object
 *                     Men Group B - Age 31 to 45:
 *                       type: object
 *                     Men Group C - Age above 45:
 *                       type: object
 */
router.get('/reports/participant-statistics', isAdmin, adminController.getParticipantStatisticsReport);

/**
 * @swagger
 * /api/admin/import-excel:
 *   post:
 *     summary: Import participants from Excel file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - excelFile
 *             properties:
 *               excelFile:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Excel file (.xlsx, .xls, .csv) with participant details.
 *                   Required columns: Sr_No, Name, Email, Mobile_No, Gender, City, Pincode, T_Shirt_Size, Birth_Date, Amount.
 *                   BIB_NO is optional and will be auto-generated.
 *                   
 *                   Birth Date formats supported:
 *                   - YYYY-MM-DD (e.g., 1990-05-15)
 *                   - MM/DD/YYYY (e.g., 05/15/1990)
 *                   - DD-MM-YYYY (e.g., 15-05-1990)
 *                   - Excel serial date number (e.g., 33015)
 *                   - Any format that JavaScript Date can parse
 *     responses:
 *       200:
 *         description: Participants imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Sr_No:
 *                         type: integer
 *                       BIB_NO:
 *                         type: string
 *                       Name:
 *                         type: string
 *                       Email:
 *                         type: string
 *                       Mobile_No:
 *                         type: string
 *                       Gender:
 *                         type: string
 *                       City:
 *                         type: string
 *                       Pincode:
 *                         type: string
 *                       T_Shirt_Size:
 *                         type: string
 *                       Birth_Date:
 *                         type: string
 *                         format: date
 *                       Amount:
 *                         type: number
 *                 count:
 *                   type: integer
 *                 notificationsSent:
 *                   type: integer
 *                 notificationErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       participantId:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       mobileNo:
 *                         type: string
 *                       error:
 *                         type: string
 *                       details:
 *                         type: string
 *       400:
 *         description: Validation errors or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       srNo:
 *                         type: integer
 *                       rowNumber:
 *                         type: integer
 *                       errors:
 *                         type: array
 *                         items:
 *                           type: string
 */
const { handleExcelUpload } = require('../middleware/upload.middleware');
router.post('/import-excel', isAdmin, handleExcelUpload, adminController.importParticipantsFromExcel);

module.exports = router;

