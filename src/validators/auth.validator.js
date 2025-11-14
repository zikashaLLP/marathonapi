const { body } = require('express-validator');

const sendOTPValidator = [
  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isMobilePhone('en-IN')
    .withMessage('Invalid mobile number format')
];

const verifyOTPValidator = [
  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isMobilePhone('en-IN')
    .withMessage('Invalid mobile number format'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must be numeric')
];

module.exports = {
  sendOTPValidator,
  verifyOTPValidator
};

