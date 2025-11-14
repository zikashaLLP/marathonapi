const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAndSendOTP, verifyOTP } = require('./otp.service');
const { formatPhoneNumber } = require('../utils/helpers');
const logger = require('../utils/logger');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Send OTP for login/registration
const sendOTP = async (mobileNumber) => {
  try {
    const formattedMobile = formatPhoneNumber(mobileNumber);
    
    let user = await User.findOne({
      where: { Mobile_Number: formattedMobile }
    });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = await User.create({
        Mobile_Number: formattedMobile,
        Is_Verified: false
      });
    }
    
    // Generate and send OTP
    const { otp, otpExpiry } = await generateAndSendOTP(formattedMobile);
    
    // Store OTP and timestamp (in production, hash the OTP)
    user.OTP = otp; // In production, hash this with bcrypt
    user.OTP_Timestamp = otpExpiry;
    await user.save();
    
    return {
      success: true,
      message: 'OTP sent successfully',
      mobileNumber: formattedMobile,
      isNewUser: !user.Is_Verified
    };
  } catch (error) {
    logger.error('Error in sendOTP:', error);
    throw error;
  }
};

// Verify OTP and login
const verifyOTPAndLogin = async (mobileNumber, otp) => {
  try {
    const formattedMobile = formatPhoneNumber(mobileNumber);
    
    const user = await User.findOne({
      where: { Mobile_Number: formattedMobile }
    });
    
    if (!user) {
      throw new Error('User not found. Please request OTP first.');
    }
    
    // Verify OTP timestamp (check if OTP is still valid)
    const isOTPValid = verifyOTP(user.OTP_Timestamp, parseInt(process.env.OTP_EXPIRY_MINUTES) || 10);
    
    if (!isOTPValid) {
      throw new Error('OTP expired. Please request a new OTP.');
    }
    
    // Verify the actual OTP value
    if (user.OTP !== otp) {
      throw new Error('Invalid OTP. Please check and try again.');
    }
    
    // Mark user as verified and clear OTP
    user.Is_Verified = true;
    user.OTP = null;
    user.OTP_Timestamp = null;
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user.Id);
    
    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.Id,
        mobileNumber: user.Mobile_Number,
        isVerified: user.Is_Verified
      }
    };
  } catch (error) {
    logger.error('Error in verifyOTPAndLogin:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTPAndLogin,
  generateToken
};

