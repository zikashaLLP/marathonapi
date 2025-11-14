const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../utils/constants');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If admin role, skip user verification (userId = 0)
    if (decoded.role === 'admin' && decoded.userId === 0) {
      req.user = {
        userId: 0,
        role: 'admin'
      };
      return next();
    }
    
    // For user role, verify user exists and is verified
    if (decoded.role === 'user') {
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.Is_Verified) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token or user not verified.'
        });
      }

      req.user = {
        userId: user.Id,
        mobileNumber: user.Mobile_Number,
        isVerified: user.Is_Verified,
        role: 'user'
      };
      
      return next();
    }
    
    // Invalid role
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token role.'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authentication error.',
      error: error.message
    });
  }
};

module.exports = { authenticate };

