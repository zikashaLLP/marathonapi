const { HTTP_STATUS } = require('../utils/constants');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

const adminLogin = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;
    
    const result = await authService.adminLogin(mobileNumber, password);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        token: result.token,
        admin: result.admin
      }
    });
  } catch (error) {
    logger.error('Error in adminLogin controller:', error);
    next(error);
  }
};

module.exports = {
  adminLogin
};

