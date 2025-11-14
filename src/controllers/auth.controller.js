const { HTTP_STATUS } = require('../utils/constants');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

const sendOTP = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    
    const result = await authService.sendOTP(mobileNumber);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        mobileNumber: result.mobileNumber,
        isNewUser: result.isNewUser
      }
    });
  } catch (error) {
    logger.error('Error in sendOTP controller:', error);
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body;
    
    const result = await authService.verifyOTPAndLogin(mobileNumber, otp);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    logger.error('Error in verifyOTP controller:', error);
    next(error);
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};

