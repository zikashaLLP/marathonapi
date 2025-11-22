const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');
const { bulkRegisterParticipantValidator } = require('../validators/bulkParticipant.validator');
const { validate } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/participant/register:
 *   post:
 *     summary: Register multiple participants for multiple marathons (No authentication required)
 *     tags: [Participant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrations
 *             properties:
 *               registrations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - marathonId
 *                     - participantData
 *                   properties:
 *                     marathonId:
 *                       type: integer
 *                     participantData:
 *                       type: object
 *     responses:
 *       201:
 *         description: Participants registered successfully
 */
router.post(
  '/register',
  bulkRegisterParticipantValidator,
  validate,
  participantController.registerParticipant
);

/**
 * @swagger
 * /api/participant/{participantId}:
 *   get:
 *     summary: Get participant details (No authentication required)
 *     tags: [Participant]
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
router.get('/:participantId', participantController.getParticipant);

module.exports = router;

