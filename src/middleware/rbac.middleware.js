const { HTTP_STATUS } = require('../utils/constants');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Admin authentication middleware
// Supports both JWT token (from admin login) and Basic Auth (legacy)
const isAdmin = async (req, res, next) => {
  try {
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Admin credentials required.'
      });
    }

    // Check if it's a Bearer token (JWT from admin login)
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is for admin (role === 'admin' and userId === 0)
        if (decoded.role === 'admin' && decoded.userId === 0) {
          req.admin = {
            mobile: adminMobile,
            role: 'admin',
            userId: 0
          };
          return next();
        } else {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
          });
        }
      } catch (tokenError) {
        // If JWT verification fails, fall through to Basic Auth check
      }
    }

    // Fallback to Basic Auth (legacy support)
    if (authHeader.startsWith('Basic ')) {
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

      return next();
    }

    // If neither Bearer nor Basic auth format
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid authorization format. Use Bearer token or Basic auth.'
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Admin authentication error.',
      error: error.message
    });
  }
};

module.exports = { isAdmin };
