const { body } = require('express-validator');
const { MARATHON_TYPE, GENDER, RESULT_POSITION } = require('../utils/constants');

const uploadResultValidator = [
  body('Marathon_Id')
    .notEmpty()
    .withMessage('Marathon ID is required')
    .isInt()
    .withMessage('Marathon ID must be an integer'),
  body('BIB_Number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('BIB number must be less than 50 characters'),
  body('Name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('Gender')
    .optional()
    .isIn([GENDER.MALE, GENDER.FEMALE])
    .withMessage('Invalid gender value'),
  body('Race_Time')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Race time must be less than 50 characters'),
  body('Category')
    .optional()
    .isIn(Object.values(MARATHON_TYPE))
    .withMessage('Invalid category value'),
  body('Position')
    .optional()
    .isIn(Object.values(RESULT_POSITION))
    .withMessage('Invalid position value')
];

const bulkUploadResultValidator = [
  body('results')
    .isArray()
    .withMessage('Results must be an array')
    .notEmpty()
    .withMessage('Results array cannot be empty'),
  body('results.*.Marathon_Id')
    .notEmpty()
    .withMessage('Marathon ID is required for all results')
    .isInt()
    .withMessage('Marathon ID must be an integer')
];

module.exports = {
  uploadResultValidator,
  bulkUploadResultValidator
};

