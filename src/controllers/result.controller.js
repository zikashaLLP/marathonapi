const { HTTP_STATUS } = require('../utils/constants');
const resultService = require('../services/result.service');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const uploadResult = async (req, res, next) => {
  try {
    const resultData = req.body;
    
    // Handle image file upload
    if (req.file) {
      // Save the file path relative to public folder
      resultData.Image = `/public/uploads/result-images/${req.file.filename}`;
    }
    
    const result = await resultService.uploadResult(resultData);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Result uploaded successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in uploadResult controller:', error);
    next(error);
  }
};

const getAllResults = async (req, res, next) => {
  try {
    const filters = {
      marathonId: req.query.marathonId ? parseInt(req.query.marathonId) : undefined,
      category: req.query.category,
      gender: req.query.gender,
      position: req.query.position
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const results = await resultService.getAllResults(filters);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    logger.error('Error in getAllResults controller:', error);
    next(error);
  }
};

const getResult = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    
    const result = await resultService.getResultById(parseInt(resultId));
    
    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Result not found'
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error in getResult controller:', error);
    next(error);
  }
};

const updateResult = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    const updateData = req.body;
    
    // Handle image file upload
    if (req.file) {
      // Get existing result to delete old file if exists
      const existingResult = await resultService.getResultById(parseInt(resultId));
      
      // Delete old file if exists
      if (existingResult && existingResult.Image) {
        const oldFilePath = path.join(__dirname, '../../', existingResult.Image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          logger.info('Deleted old result image file:', oldFilePath);
        }
      }
      
      // Save the new file path relative to public folder
      updateData.Image = `/public/uploads/result-images/${req.file.filename}`;
    }
    
    const result = await resultService.updateResult(
      parseInt(resultId),
      updateData
    );
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Result updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in updateResult controller:', error);
    next(error);
  }
};

const deleteResult = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    
    // Get result to delete associated image file
    const result = await resultService.getResultById(parseInt(resultId));
    
    if (result && result.Image) {
      const imagePath = path.join(__dirname, '../../', result.Image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        logger.info('Deleted result image file:', imagePath);
      }
    }
    
    const deleteResult = await resultService.deleteResult(parseInt(resultId));
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: deleteResult.message
    });
  } catch (error) {
    logger.error('Error in deleteResult controller:', error);
    next(error);
  }
};

const bulkUploadResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    
    const uploadedResults = await resultService.bulkUploadResults(results);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Results uploaded successfully',
      data: uploadedResults,
      count: uploadedResults.length
    });
  } catch (error) {
    logger.error('Error in bulkUploadResults controller:', error);
    next(error);
  }
};

module.exports = {
  uploadResult,
  getAllResults,
  getResult,
  updateResult,
  deleteResult,
  bulkUploadResults
};

