const { body } = require('express-validator');
const { TSHIRT_SIZES, MARATHON_TYPE, GENDER } = require('../utils/constants');

const bulkRegisterParticipantValidator = [
  body('registrations')
    .isArray({ min: 1 })
    .withMessage('Registrations must be a non-empty array'),
  body('registrations.*.marathonId')
    .notEmpty()
    .withMessage('Marathon ID is required for each registration')
    .isInt({ min: 1 })
    .withMessage('Marathon ID must be a positive integer'),
  body('registrations.*.participantData.Full_Name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('registrations.*.participantData.Email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('registrations.*.participantData.Contact_Number')
    .notEmpty()
    .withMessage('Contact number is required')
    .isMobilePhone('en-IN')
    .withMessage('Invalid contact number format'),
  body('registrations.*.participantData.Gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(Object.values(GENDER))
    .withMessage('Invalid gender value'),
  body('registrations.*.participantData.Date_of_Birth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('registrations.*.participantData.Address')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '' && value.length < 5) {
        throw new Error('Address must be at least 5 characters if provided');
      }
      return true;
    }),
  body('registrations.*.participantData.City')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('registrations.*.participantData.Pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .isPostalCode('IN')
    .withMessage('Invalid pincode format'),
  body('registrations.*.participantData.State')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value.length < 2 || value.length > 100) {
          throw new Error('State must be between 2 and 100 characters if provided');
        }
      }
      return true;
    }),
  body('registrations.*.participantData.Tshirt_Size')
    .notEmpty()
    .withMessage('T-shirt size is required')
    .isIn(TSHIRT_SIZES)
    .withMessage('Invalid T-shirt size'),
  body('registrations.*.participantData.Blood_Group')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value.length < 1 || value.length > 10) {
          throw new Error('Blood group must be between 1 and 10 characters if provided');
        }
      }
      return true;
    }),
  body('registrations.*.participantData.Marathon_Type')
    .optional()
    .isIn(Object.values(MARATHON_TYPE))
    .withMessage('Invalid marathon type'),
  body('registrations.*.participantData.Running_Group')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Running group must be less than 255 characters'),
  body('registrations.*.participantData.Is_Terms_Condition_Accepted')
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
  bulkRegisterParticipantValidator
};

