const Marathon = require('../models/Marathon');
const logger = require('../utils/logger');

// Create marathon
const createMarathon = async (marathonData) => {
  try {
    const marathon = await Marathon.create(marathonData);
    return marathon;
  } catch (error) {
    logger.error('Error in createMarathon:', error);
    throw error;
  }
};

// Get all marathons
const getAllMarathons = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.date) {
      whereClause.Date = filters.date;
    }
    
    if (filters.location) {
      whereClause.Location = { [require('sequelize').Op.like]: `%${filters.location}%` };
    }
    
    const marathons = await Marathon.findAll({
      where: whereClause,
      order: [['Date', 'DESC']]
    });
    
    return marathons;
  } catch (error) {
    logger.error('Error in getAllMarathons:', error);
    throw error;
  }
};

// Get marathon by ID
const getMarathonById = async (marathonId) => {
  try {
    const marathon = await Marathon.findByPk(marathonId);
    return marathon;
  } catch (error) {
    logger.error('Error in getMarathonById:', error);
    throw error;
  }
};

// Update marathon
const updateMarathon = async (marathonId, updateData) => {
  try {
    const marathon = await Marathon.findByPk(marathonId);
    
    if (!marathon) {
      throw new Error('Marathon not found');
    }
    
    await marathon.update(updateData);
    return marathon;
  } catch (error) {
    logger.error('Error in updateMarathon:', error);
    throw error;
  }
};

// Delete marathon
const deleteMarathon = async (marathonId) => {
  try {
    const marathon = await Marathon.findByPk(marathonId);
    
    if (!marathon) {
      throw new Error('Marathon not found');
    }
    
    await marathon.destroy();
    return { success: true, message: 'Marathon deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteMarathon:', error);
    throw error;
  }
};

module.exports = {
  createMarathon,
  getAllMarathons,
  getMarathonById,
  updateMarathon,
  deleteMarathon
};

