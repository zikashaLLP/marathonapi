const express = require('express');
const router = express.Router();
const marathonController = require('../controllers/marathon.controller');
const { createMarathonValidator, updateMarathonValidator } = require('../validators/marathon.validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/rbac.middleware');
const { handleUpload } = require('../middleware/upload.middleware');

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *             properties:
 *               Name:
 *                 type: string
 *               Description:
 *                 type: string
 *               Track_Length:
 *                 type: string
 *               Date:
 *                 type: string
 *                 format: date
 *               Reporting_Time:
 *                 type: string
 *                 format: time
 *                 example: "06:00"
 *               Run_Start_Time:
 *                 type: string
 *                 format: time
 *                 example: "07:00"
 *               Location:
 *                 type: string
 *               Terms_Conditions:
 *                 type: string
 *               How_To_Apply:
 *                 type: string
 *               Eligibility_Criteria:
 *                 type: string
 *               Rules_Regulations:
 *                 type: string
 *               Runner_Amenities:
 *                 type: string
 *               routeMap:
 *                 type: string
 *                 format: binary
 *                 description: Route map image file (optional, accepts image files only, max 5MB)
 *               Price_List:
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
  handleUpload,
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
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Description:
 *                 type: string
 *               Track_Length:
 *                 type: string
 *               Date:
 *                 type: string
 *                 format: date
 *               Reporting_Time:
 *                 type: string
 *                 format: time
 *                 example: "06:00"
 *               Run_Start_Time:
 *                 type: string
 *                 format: time
 *                 example: "07:00"
 *               Location:
 *                 type: string
 *               Terms_Conditions:
 *                 type: string
 *               How_To_Apply:
 *                 type: string
 *               Eligibility_Criteria:
 *                 type: string
 *               Rules_Regulations:
 *                 type: string
 *               Runner_Amenities:
 *                 type: string
 *               routeMap:
 *                 type: string
 *                 format: binary
 *                 description: Route map image file (optional, accepts image files only, max 5MB)
 *               Price_List:
 *                 type: string
 *               Fees_Amount:
 *                 type: number
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
  handleUpload,
  updateMarathonValidator,
  validate,
  marathonController.updateMarathon
);
router.delete('/:marathonId', authenticate, isAdmin, marathonController.deleteMarathon);

module.exports = router;

