const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const { uploadResultValidator, bulkUploadResultValidator } = require('../validators/result.validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/rbac.middleware');

/**
 * @swagger
 * /api/result:
 *   get:
 *     summary: Get all results
 *     tags: [Result]
 *     parameters:
 *       - in: query
 *         name: marathonId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Open, Defence]
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [First, Second, Third]
 *     responses:
 *       200:
 *         description: List of results
 *   post:
 *     summary: Upload result (Admin only)
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Marathon_Id
 *             properties:
 *               Marathon_Id:
 *                 type: integer
 *               BIB_Number:
 *                 type: string
 *               Name:
 *                 type: string
 *               Gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               Race_Time:
 *                 type: string
 *               Category:
 *                 type: string
 *                 enum: [Open, Defence]
 *               Position:
 *                 type: string
 *                 enum: [First, Second, Third]
 *     responses:
 *       201:
 *         description: Result uploaded successfully
 */
router.get('/', resultController.getAllResults);
router.post(
  '/',
  authenticate,
  isAdmin,
  uploadResultValidator,
  validate,
  resultController.uploadResult
);

/**
 * @swagger
 * /api/result/bulk-upload:
 *   post:
 *     summary: Bulk upload results (Admin only)
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - results
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Results uploaded successfully
 */
router.post(
  '/bulk-upload',
  authenticate,
  isAdmin,
  bulkUploadResultValidator,
  validate,
  resultController.bulkUploadResults
);

/**
 * @swagger
 * /api/result/{resultId}:
 *   get:
 *     summary: Get result by ID
 *     tags: [Result]
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Result details
 *   put:
 *     summary: Update result (Admin only)
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Result updated successfully
 *   delete:
 *     summary: Delete result (Admin only)
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Result deleted successfully
 */
router.get('/:resultId', resultController.getResult);
router.put('/:resultId', authenticate, isAdmin, resultController.updateResult);
router.delete('/:resultId', authenticate, isAdmin, resultController.deleteResult);

module.exports = router;

