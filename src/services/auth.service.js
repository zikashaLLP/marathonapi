const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId, role = 'admin') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Admin login
const adminLogin = async (mobileNumber, password) => {
  try {
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminMobile || !adminPassword) {
      throw new Error('Admin credentials not configured');
    }
    
    if (mobileNumber !== adminMobile || password !== adminPassword) {
      throw new Error('Invalid admin credentials');
    }
    
    // Generate JWT token for admin with userId = 0 and role = 'admin'
    const token = generateToken(0, 'admin');
    
    return {
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: 0,
        mobile: adminMobile,
        role: 'admin'
      }
    };
  } catch (error) {
    logger.error('Error in adminLogin:', error);
    throw error;
  }
};

module.exports = {
  generateToken,
  adminLogin
};

