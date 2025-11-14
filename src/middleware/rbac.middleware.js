const { HTTP_STATUS } = require('../utils/constants');
require('dotenv').config();

// Admin authentication middleware
const isAdmin = async (req, res, next) => {
  try {
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check if Authorization header contains admin credentials
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Admin credentials required.'
      });
    }

    // Basic auth format: Basic base64(mobile:password)
    const base64Credentials = authHeader.replace('Basic ', '');
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [mobile, password] = credentials.split(':');

    if (mobile !== adminMobile || password !== adminPassword) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    req.admin = {
      mobile: mobile,
      role: 'admin'
    };

    next();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Admin authentication error.',
      error: error.message
    });
  }
};

module.exports = { isAdmin };

