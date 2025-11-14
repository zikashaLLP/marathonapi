const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');
const { registerParticipantValidator } = require('../validators/participant.validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/participant/marathon/{marathonId}/register:
 *   post:
 *     summary: Register for a marathon
 *     tags: [Participant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marathonId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Full_Name
 *               - Email
 *               - Contact_Number
 *               - Gender
 *               - Date_of_Birth
 *               - Address
 *               - City
 *               - Pincode
 *               - State
 *               - Tshirt_Size
 *               - Blood_Group
 *               - Is_Terms_Condition_Accepted
 *             properties:
 *               Full_Name:
 *                 type: string
 *               Email:
 *                 type: string
 *               Contact_Number:
 *                 type: string
 *               Gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               Date_of_Birth:
 *                 type: string
 *                 format: date
 *               Address:
 *                 type: string
 *               City:
 *                 type: string
 *               Pincode:
 *                 type: string
 *               State:
 *                 type: string
 *               Tshirt_Size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL]
 *               Blood_Group:
 *                 type: string
 *               Marathon_Type:
 *                 type: string
 *                 enum: [Open, Defence]
 *               Running_Group:
 *                 type: string
 *               Is_Terms_Condition_Accepted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Participant registered successfully
 */
router.post(
  '/marathon/:marathonId/register',
  authenticate,
  registerParticipantValidator,
  validate,
  participantController.registerParticipant
);

/**
 * @swagger
 * /api/participant/{participantId}:
 *   get:
 *     summary: Get participant details
 *     tags: [Participant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participant details
 */
router.get('/:participantId', authenticate, participantController.getParticipant);

/**
 * @swagger
 * /api/participant:
 *   get:
 *     summary: Get all participants for logged in user
 *     tags: [Participant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of participants
 */
router.get('/', authenticate, participantController.getUserParticipants);

module.exports = router;

