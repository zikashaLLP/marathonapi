const { Op } = require('sequelize');
const Participant = require('../models/Participant');
const ParticipantDetails = require('../models/ParticipantDetails');
const Marathon = require('../models/Marathon');
const { generateBIBNumber, calculateAge } = require('../utils/helpers');
const logger = require('../utils/logger');

// Register participant
const registerParticipant = async (userId, marathonId, participantData) => {
  try {
    // Check if marathon exists
    const marathon = await Marathon.findByPk(marathonId);
    if (!marathon) {
      throw new Error('Marathon not found');
    }
    
    // Check if user already registered for this marathon
    const existingParticipant = await Participant.findOne({
      where: {
        User_Id: userId,
        Marathon_Id: marathonId
      }
    });
    
    if (existingParticipant) {
      throw new Error('You are already registered for this marathon');
    }
    
    // Calculate age from date of birth
    const age = calculateAge(participantData.Date_of_Birth);
    participantData.Age = age;
    
    // Create participant details
    const participantDetails = await ParticipantDetails.create(participantData);
    
    // Create participant record
    const participant = await Participant.create({
      User_Id: userId,
      ParticipantDetails_Id: participantDetails.Id,
      Marathon_Id: marathonId,
      Marathon_Type: participantData.Marathon_Type || 'Open',
      Is_Payment_Completed: false
    });
    
    // Generate BIB number
    participant.BIB_Number = generateBIBNumber(marathonId, participant.Id);
    await participant.save();
    
    // Fetch complete participant data
    const completeParticipant = await Participant.findByPk(participant.Id, {
      include: [
        { model: ParticipantDetails, as: 'ParticipantDetails' },
        { model: Marathon, as: 'Marathon' }
      ]
    });
    
    return completeParticipant;
  } catch (error) {
    logger.error('Error in registerParticipant:', error);
    throw error;
  }
};

// Get participant by ID
const getParticipantById = async (participantId, userId = null) => {
  try {
    const whereClause = { Id: participantId };
    if (userId) {
      whereClause.User_Id = userId;
    }
    
    const participant = await Participant.findOne({
      where: whereClause,
      include: [
        { model: ParticipantDetails, as: 'ParticipantDetails' },
        { model: Marathon, as: 'Marathon' }
      ]
    });
    
    return participant;
  } catch (error) {
    logger.error('Error in getParticipantById:', error);
    throw error;
  }
};

// Get all participants for a user
const getUserParticipants = async (userId) => {
  try {
    const participants = await Participant.findAll({
      where: { User_Id: userId },
      include: [
        { model: ParticipantDetails, as: 'ParticipantDetails' },
        { model: Marathon, as: 'Marathon' }
      ],
      order: [['Created_At', 'DESC']]
    });
    
    return participants;
  } catch (error) {
    logger.error('Error in getUserParticipants:', error);
    throw error;
  }
};

module.exports = {
  registerParticipant,
  getParticipantById,
  getUserParticipants
};

