const { body } = require('express-validator');
const { TSHIRT_SIZES, MARATHON_TYPE, GENDER } = require('../utils/constants');

const registerParticipantValidator = [
  body('Full_Name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('Email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('Contact_Number')
    .notEmpty()
    .withMessage('Contact number is required')
    .isMobilePhone('en-IN')
    .withMessage('Invalid contact number format'),
  body('Gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(Object.values(GENDER))
    .withMessage('Invalid gender value'),
  body('Date_of_Birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('Address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters'),
  body('City')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('Pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .isPostalCode('IN')
    .withMessage('Invalid pincode format'),
  body('State')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('Tshirt_Size')
    .notEmpty()
    .withMessage('T-shirt size is required')
    .isIn(TSHIRT_SIZES)
    .withMessage('Invalid T-shirt size'),
  body('Blood_Group')
    .notEmpty()
    .withMessage('Blood group is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Invalid blood group format'),
  body('Marathon_Type')
    .optional()
    .isIn(Object.values(MARATHON_TYPE))
    .withMessage('Invalid marathon type'),
  body('Running_Group')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Running group must be less than 255 characters'),
  body('Is_Terms_Condition_Accepted')
    .notEmpty()
    .withMessage('Terms and conditions acceptance is required')
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must accept terms and conditions');
      }
      return true;
    })
];

module.exports = {
  registerParticipantValidator
};

