const { body, param } = require('express-validator');

const createPaymentValidator = [
  body('participantIds')
    .notEmpty()
    .withMessage('participantIds array is required')
    .isArray({ min: 1 })
    .withMessage('participantIds must be a non-empty array')
    .custom((value) => {
      if (value.some(id => !Number.isInteger(parseInt(id)))) {
        throw new Error('All participant IDs must be valid integers');
      }
      return true;
    }),
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be a positive number')
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

