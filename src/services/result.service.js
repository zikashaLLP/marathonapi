const Result = require('../models/Result');
const Marathon = require('../models/Marathon');
const logger = require('../utils/logger');

// Upload result
const uploadResult = async (resultData) => {
  try {
    // Check if marathon exists
    const marathon = await Marathon.findByPk(resultData.Marathon_Id);
    if (!marathon) {
      throw new Error('Marathon not found');
    }
    
    const result = await Result.create(resultData);
    return result;
  } catch (error) {
    logger.error('Error in uploadResult:', error);
    throw error;
  }
};

// Get all results
const getAllResults = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.marathonId) {
      whereClause.Marathon_Id = filters.marathonId;
    }
    
    if (filters.category) {
      whereClause.Category = filters.category;
    }
    
    if (filters.gender) {
      whereClause.Gender = filters.gender;
    }
    
    if (filters.position) {
      whereClause.Position = filters.position;
    }
    
    const results = await Result.findAll({
      where: whereClause,
      include: [
        { model: Marathon, as: 'Marathon' }
      ],
      order: [
        ['Marathon_Id', 'ASC'],
        ['Category', 'ASC'],
        ['Gender', 'ASC'],
        ['Position', 'ASC']
      ]
    });
    
    return results;
  } catch (error) {
    logger.error('Error in getAllResults:', error);
    throw error;
  }
};

// Get result by ID
const getResultById = async (resultId) => {
  try {
    const result = await Result.findByPk(resultId, {
      include: [
        { model: Marathon, as: 'Marathon' }
      ]
    });
    
    return result;
  } catch (error) {
    logger.error('Error in getResultById:', error);
    throw error;
  }
};

// Update result
const updateResult = async (resultId, updateData) => {
  try {
    const result = await Result.findByPk(resultId);
    
    if (!result) {
      throw new Error('Result not found');
    }
    
    await result.update(updateData);
    return result;
  } catch (error) {
    logger.error('Error in updateResult:', error);
    throw error;
  }
};

// Delete result
const deleteResult = async (resultId) => {
  try {
    const result = await Result.findByPk(resultId);
    
    if (!result) {
      throw new Error('Result not found');
    }
    
    await result.destroy();
    return { success: true, message: 'Result deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteResult:', error);
    throw error;
  }
};

// Bulk upload results
const bulkUploadResults = async (resultsData) => {
  try {
    const results = await Result.bulkCreate(resultsData, {
      validate: true,
      returning: true
    });
    
    return results;
  } catch (error) {
    logger.error('Error in bulkUploadResults:', error);
    throw error;
  }
};

module.exports = {
  uploadResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  bulkUploadResults
};

