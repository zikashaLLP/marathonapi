// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const Participant = require('../models/Participant');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Generate BIB Number - starts from 0001 and increments (formatted as 4 digits)
const generateBIBNumber = async (transaction = null) => {
  // Get all BIB numbers that are numeric and find the maximum
  const participants = await Participant.findAll({
    where: {
      BIB_Number: {
        [Op.not]: null,
        [Op.regexp]: '^[0-9]+$'
      }
    },
    attributes: ['BIB_Number'],
    transaction
  });
  
  let nextBibNumber = 1; // Starting number
  
  if (participants && participants.length > 0) {
    // Extract numeric BIB numbers and find max
    const bibNumbers = participants
      .map(p => parseInt(p.BIB_Number))
      .filter(num => !isNaN(num) && num >= 1);
    
    if (bibNumbers.length > 0) {
      const maxBib = Math.max(...bibNumbers);
      nextBibNumber = maxBib + 1;
    }
  }
  
  // Format as 4-digit string with leading zeros (e.g., "0001", "0002", "0123")
  return nextBibNumber.toString().padStart(4, '0');
};

// Find and release the smallest numeric BIB that belongs to an unpaid participant
const claimReusableBIBNumber = async (transaction = null) => {
  const reusableParticipant = await Participant.findOne({
    where: {
      Is_Payment_Completed: false,
      BIB_Number: {
        [Op.not]: null,
        [Op.regexp]: '^[0-9]+$'
      }
    },
    order: [[sequelize.literal('CAST(BIB_Number AS UNSIGNED)'), 'ASC']],
    transaction
  });

  if (!reusableParticipant) {
    return null;
  }

  const reusableBib = reusableParticipant.BIB_Number;
  reusableParticipant.BIB_Number = null;
  await reusableParticipant.save({ transaction });
  return reusableBib;
};

// Provide the next available BIB, prioritizing reusable ones
const getNextAvailableBIBNumber = async (transaction = null) => {
  const reusableBib = await claimReusableBIBNumber(transaction);
  if (reusableBib) {
    return reusableBib;
  }

  return generateBIBNumber(transaction);
};

// Format phone number
const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(formatPhoneNumber(phone));
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  generateOTP,
  generateBIBNumber,
  claimReusableBIBNumber,
  getNextAvailableBIBNumber,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  calculateAge
};

