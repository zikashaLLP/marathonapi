const { HTTP_STATUS } = require('../utils/constants');
const participantService = require('../services/participant.service');
const logger = require('../utils/logger');

// Register multiple participants for multiple marathons
// POST /api/participant/register with { registrations: [{ marathonId, participantData }, ...] } in body
const registerParticipant = async (req, res, next) => {
  try {
    const { registrations } = req.body;
    
    if (!registrations || !Array.isArray(registrations) || registrations.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Registrations array is required and must not be empty'
      });
    }
    
    const result = await participantService.registerParticipant(registrations);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: `${result.participants.length} participant(s) registered successfully`,
      data: {
        participants: result.participants,
        totalAmount: result.totalAmount,
        participantIds: result.participants.map(p => p.Id)
      }
    });
  } catch (error) {
    logger.error('Error in registerParticipant controller:', error);
    next(error);
  }
};

const getParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    
    const participant = await participantService.getParticipantById(parseInt(participantId));
    
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

module.exports = {
  registerParticipant,
  getParticipant
};

