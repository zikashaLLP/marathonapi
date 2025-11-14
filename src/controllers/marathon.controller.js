const { HTTP_STATUS } = require('../utils/constants');
const marathonService = require('../services/marathon.service');
const logger = require('../utils/logger');

const createMarathon = async (req, res, next) => {
  try {
    const marathonData = req.body;
    
    const marathon = await marathonService.createMarathon(marathonData);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Marathon created successfully',
      data: marathon
    });
  } catch (error) {
    logger.error('Error in createMarathon controller:', error);
    next(error);
  }
};

const getAllMarathons = async (req, res, next) => {
  try {
    const filters = {
      date: req.query.date,
      location: req.query.location
    };
    
    const marathons = await marathonService.getAllMarathons(filters);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: marathons,
      count: marathons.length
    });
  } catch (error) {
    logger.error('Error in getAllMarathons controller:', error);
    next(error);
  }
};

const getMarathon = async (req, res, next) => {
  try {
    const { marathonId } = req.params;
    
    const marathon = await marathonService.getMarathonById(parseInt(marathonId));
    
    if (!marathon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Marathon not found'
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: marathon
    });
  } catch (error) {
    logger.error('Error in getMarathon controller:', error);
    next(error);
  }
};

const updateMarathon = async (req, res, next) => {
  try {
    const { marathonId } = req.params;
    const updateData = req.body;
    
    const marathon = await marathonService.updateMarathon(
      parseInt(marathonId),
      updateData
    );
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Marathon updated successfully',
      data: marathon
    });
  } catch (error) {
    logger.error('Error in updateMarathon controller:', error);
    next(error);
  }
};

const deleteMarathon = async (req, res, next) => {
  try {
    const { marathonId } = req.params;
    
    const result = await marathonService.deleteMarathon(parseInt(marathonId));
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in deleteMarathon controller:', error);
    next(error);
  }
};

module.exports = {
  createMarathon,
  getAllMarathons,
  getMarathon,
  updateMarathon,
  deleteMarathon
};

