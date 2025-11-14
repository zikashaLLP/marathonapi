const { body } = require('express-validator');

const createMarathonValidator = [
  body('Name')
    .notEmpty()
    .withMessage('Marathon name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Marathon name must be between 2 and 255 characters'),
  body('Track_Length')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Track length must be less than 50 characters'),
  body('Date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('Reporting_Time')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('Run_Start_Time')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('Location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('Fees_Amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fees amount must be a positive number')
];

const updateMarathonValidator = [
  body('Name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Marathon name must be between 2 and 255 characters'),
  body('Date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('Reporting_Time')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('Run_Start_Time')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('Fees_Amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fees amount must be a positive number')
];

module.exports = {
  createMarathonValidator,
  updateMarathonValidator
};

