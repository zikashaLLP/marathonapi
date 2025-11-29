const { Op } = require('sequelize');
const Participant = require('../models/Participant');
const ParticipantDetails = require('../models/ParticipantDetails');
const Marathon = require('../models/Marathon');
const { calculateAge, getNextAvailableBIBNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

// Register multiple participants for multiple marathons
const registerParticipant = async (registrations) => {
  const transaction = await Participant.sequelize.transaction();
  
  try {
    const createdParticipants = [];
    let totalAmount = 0;
    
    // Validate all marathons exist and calculate total amount
    const marathonIds = [...new Set(registrations.map(r => r.marathonId))];
    const marathons = await Marathon.findAll({
      where: { Id: { [Op.in]: marathonIds } },
      transaction
    });
    
    if (marathons.length !== marathonIds.length) {
      throw new Error('One or more marathons not found');
    }
    
    const marathonMap = {};
    marathons.forEach(marathon => {
      marathonMap[marathon.Id] = marathon;
    });
    
    // Process each registration
    for (const registration of registrations) {
      const { marathonId, participantData } = registration;
      const marathon = marathonMap[marathonId];
      
      if (!marathon) {
        throw new Error(`Marathon with ID ${marathonId} not found`);
      }
      
      // Convert empty strings to null for optional fields
      if (participantData.Address === '') {
        participantData.Address = null;
      }
      if (participantData.State === '') {
        participantData.State = null;
      }
      if (participantData.Blood_Group === '') {
        participantData.Blood_Group = null;
      }
      
      // Calculate age from date of birth
      const age = calculateAge(participantData.Date_of_Birth);
      participantData.Age = age;
      
      // Create participant details
      const participantDetails = await ParticipantDetails.create(participantData, { transaction });
      
      // Create participant record
      const participant = await Participant.create({
        ParticipantDetails_Id: participantDetails.Id,
        Marathon_Id: marathonId,
        Marathon_Type: participantData.Marathon_Type || 'Open',
        Is_Payment_Completed: false
      }, { transaction });
      
      // Add marathon fee to total amount
      if (marathon.Fees_Amount) {
        totalAmount += parseFloat(marathon.Fees_Amount);
      }
      
      // Fetch complete participant data
      const completeParticipant = await Participant.findByPk(participant.Id, {
        include: [
          { model: ParticipantDetails, as: 'ParticipantDetails' },
          { model: Marathon, as: 'Marathon' }
        ],
        transaction
      });
      
      createdParticipants.push(completeParticipant);
    }
    
    await transaction.commit();
    
    logger.info(`Registration successful: ${createdParticipants.length} participant(s) registered, Total amount: ${totalAmount}`);
    
    return {
      participants: createdParticipants,
      totalAmount: totalAmount.toFixed(2)
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Error in registerParticipant:', error);
    throw error;
  }
};

// Get participant by ID
const getParticipantById = async (participantId) => {
  try {
    const participant = await Participant.findOne({
      where: { Id: participantId },
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

// Get participants by IDs (for payment verification)
const getParticipantsByIds = async (participantIds) => {
  try {
    const participants = await Participant.findAll({
      where: { Id: { [Op.in]: participantIds } },
      include: [
        { model: ParticipantDetails, as: 'ParticipantDetails' },
        { model: Marathon, as: 'Marathon' }
      ]
    });
    
    return participants;
  } catch (error) {
    logger.error('Error in getParticipantsByIds:', error);
    throw error;
  }
};

const finalizeParticipantPayment = async (participantId) => {
  const transaction = await Participant.sequelize.transaction();
  
  try {
    const participant = await Participant.findOne({
      where: { Id: participantId },
      include: [
        { model: ParticipantDetails, as: 'ParticipantDetails' },
        { model: Marathon, as: 'Marathon' }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!participant) {
      throw new Error(`Participant with ID ${participantId} not found`);
    }

    participant.Is_Payment_Completed = true;

    if (!participant.BIB_Number) {
      const bibNumber = await getNextAvailableBIBNumber(transaction);
      participant.BIB_Number = bibNumber;
    }

    await participant.save({ transaction });
    await transaction.commit();

    return participant;
  } catch (error) {
    await transaction.rollback();
    logger.error('Error in finalizeParticipantPayment:', error);
    throw error;
  }
};

module.exports = {
  registerParticipant,
  getParticipantById,
  getParticipantsByIds,
  finalizeParticipantPayment
};

