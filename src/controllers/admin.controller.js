const { HTTP_STATUS } = require('../utils/constants');
const adminService = require('../services/admin.service');
const logger = require('../utils/logger');

const getMarathonParticipants = async (req, res, next) => {
  try {
    const filters = {
      marathonId: req.query.marathonId ? parseInt(req.query.marathonId) : undefined,
      marathonType: req.query.marathonType,
      isPaymentCompleted: req.query.isPaymentCompleted !== undefined ? req.query.isPaymentCompleted === 'true' : undefined,
      gender: req.query.gender,
      city: req.query.city,
      state: req.query.state,
      tshirtSize: req.query.tshirtSize,
      marathonName: req.query.marathonName
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const participants = await adminService.getMarathonParticipants(filters);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    logger.error('Error in getMarathonParticipants controller:', error);
    next(error);
  }
};

const getTshirtSizeReport = async (req, res, next) => {
  try {
    const marathonId = req.query.marathonId ? parseInt(req.query.marathonId) : null;
    
    const report = await adminService.getTshirtSizeReport(marathonId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error in getTshirtSizeReport controller:', error);
    next(error);
  }
};

const getPaymentStatistics = async (req, res, next) => {
  try {
    const marathonId = req.query.marathonId ? parseInt(req.query.marathonId) : null;
    
    const statistics = await adminService.getPaymentStatistics(marathonId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Error in getPaymentStatistics controller:', error);
    next(error);
  }
};

module.exports = {
  getMarathonParticipants,
  getTshirtSizeReport,
  getPaymentStatistics
};

