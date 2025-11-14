const express = require('express');
const router = express.Router();
const marathonController = require('../controllers/marathon.controller');
const { createMarathonValidator, updateMarathonValidator } = require('../validators/marathon.validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/rbac.middleware');

/**
 * @swagger
 * /api/marathon:
 *   get:
 *     summary: Get all marathons
 *     tags: [Marathon]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of marathons
 *   post:
 *     summary: Create a new marathon (Admin only)
 *     tags: [Marathon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *             properties:
 *               Name:
 *                 type: string
 *               Track_Length:
 *                 type: string
 *               Date:
 *                 type: string
 *                 format: date
 *               Reporting_Time:
 *                 type: string
 *               Run_Start_Time:
 *                 type: string
 *               Location:
 *                 type: string
 *               Fees_Amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Marathon created successfully
 */
router.get('/', marathonController.getAllMarathons);
router.post(
  '/',
  authenticate,
  isAdmin,
  createMarathonValidator,
  validate,
  marathonController.createMarathon
);

/**
 * @swagger
 * /api/marathon/{marathonId}:
 *   get:
 *     summary: Get marathon by ID
 *     tags: [Marathon]
 *     parameters:
 *       - in: path
 *         name: marathonId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marathon details
 *   put:
 *     summary: Update marathon (Admin only)
 *     tags: [Marathon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marathonId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marathon updated successfully
 *   delete:
 *     summary: Delete marathon (Admin only)
 *     tags: [Marathon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marathonId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marathon deleted successfully
 */
router.get('/:marathonId', marathonController.getMarathon);
router.put(
  '/:marathonId',
  authenticate,
  isAdmin,
  updateMarathonValidator,
  validate,
  marathonController.updateMarathon
);
router.delete('/:marathonId', authenticate, isAdmin, marathonController.deleteMarathon);

module.exports = router;

