const { body, param } = require('express-validator');

const createPaymentValidator = [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .isInt()
    .withMessage('Participant ID must be an integer'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
];

const paymentStatusValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
];

module.exports = {
  createPaymentValidator,
  paymentStatusValidator
};

