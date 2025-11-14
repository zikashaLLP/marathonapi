const { HTTP_STATUS } = require('../utils/constants');
const participantService = require('../services/participant.service');
const logger = require('../utils/logger');

const registerParticipant = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { marathonId } = req.params;
    const participantData = req.body;
    
    const participant = await participantService.registerParticipant(
      userId,
      parseInt(marathonId),
      participantData
    );
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Participant registered successfully',
      data: participant
    });
  } catch (error) {
    logger.error('Error in registerParticipant controller:', error);
    next(error);
  }
};

const getParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    const userId = req.user.userId;
    
    const participant = await participantService.getParticipantById(
      parseInt(participantId),
      userId
    );
    
    if (!participant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: participant
    });
  } catch (error) {
    logger.error('Error in getParticipant controller:', error);
    next(error);
  }
};

const getUserParticipants = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const participants = await participantService.getUserParticipants(userId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    logger.error('Error in getUserParticipants controller:', error);
    next(error);
  }
};

module.exports = {
  registerParticipant,
  getParticipant,
  getUserParticipants
};

