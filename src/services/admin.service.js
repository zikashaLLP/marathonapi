const { Op } = require('sequelize');
const Participant = require('../models/Participant');
const ParticipantDetails = require('../models/ParticipantDetails');
const Marathon = require('../models/Marathon');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Get marathon participants with filters
const getMarathonParticipants = async (filters = {}) => {
  try {
    const whereClause = {};
    const participantDetailsWhere = {};
    const marathonWhere = {};
    
    if (filters.marathonId) {
      whereClause.Marathon_Id = filters.marathonId;
    }
    
    if (filters.marathonType) {
      whereClause.Marathon_Type = filters.marathonType;
    }
    
    if (filters.isPaymentCompleted !== undefined) {
      whereClause.Is_Payment_Completed = filters.isPaymentCompleted;
    }
    
    if (filters.gender) {
      participantDetailsWhere.Gender = filters.gender;
    }
    
    if (filters.city) {
      participantDetailsWhere.City = { [Op.like]: `%${filters.city}%` };
    }
    
    if (filters.state) {
      participantDetailsWhere.State = { [Op.like]: `%${filters.state}%` };
    }
    
    if (filters.tshirtSize) {
      participantDetailsWhere.Tshirt_Size = filters.tshirtSize;
    }
    
    if (filters.marathonName) {
      marathonWhere.Name = { [Op.like]: `%${filters.marathonName}%` };
    }
    
    const participants = await Participant.findAll({
      where: whereClause,
      include: [
        {
          model: ParticipantDetails,
          as: 'ParticipantDetails',
          where: participantDetailsWhere,
          required: true
        },
        {
          model: Marathon,
          as: 'Marathon',
          where: marathonWhere,
          required: true
        }
      ],
      order: [['Created_At', 'DESC']]
    });
    
    return participants;
  } catch (error) {
    logger.error('Error in getMarathonParticipants:', error);
    throw error;
  }
};

// Get T-shirt size count report
const getTshirtSizeReport = async (marathonId = null) => {
  try {
    const whereClause = {};
    
    if (marathonId) {
      whereClause.Marathon_Id = marathonId;
    }
    
    const participants = await Participant.findAll({
      where: whereClause,
      include: [
        {
          model: ParticipantDetails,
          as: 'ParticipantDetails',
          attributes: ['Tshirt_Size'],
          required: true
        }
      ]
    });
    
    // Count T-shirt sizes
    const sizeCount = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      Total: participants.length
    };
    
    participants.forEach(participant => {
      const size = participant.ParticipantDetails?.Tshirt_Size;
      if (size && sizeCount.hasOwnProperty(size)) {
        sizeCount[size]++;
      }
    });
    
    return sizeCount;
  } catch (error) {
    logger.error('Error in getTshirtSizeReport:', error);
    throw error;
  }
};

// Get payment statistics
const getPaymentStatistics = async (marathonId = null) => {
  try {
    const whereClause = {};
    
    if (marathonId) {
      whereClause.Marathon_Id = marathonId;
    }
    
    const participants = await Participant.findAll({
      where: whereClause,
      include: [
        {
          model: Payment,
          as: 'Payments'
        }
      ]
    });
    
    const stats = {
      totalParticipants: participants.length,
      paidParticipants: participants.filter(p => p.Is_Payment_Completed).length,
      pendingParticipants: participants.filter(p => !p.Is_Payment_Completed).length,
      totalRevenue: 0
    };
    
    participants.forEach(participant => {
      if (participant.Is_Payment_Completed && participant.Payments) {
        const successfulPayments = participant.Payments.filter(p => p.Payment_Status === 'Success');
        successfulPayments.forEach(payment => {
          stats.totalRevenue += parseFloat(payment.Amount || 0);
        });
      }
    });
    
    return stats;
  } catch (error) {
    logger.error('Error in getPaymentStatistics:', error);
    throw error;
  }
};

module.exports = {
  getMarathonParticipants,
  getTshirtSizeReport,
  getPaymentStatistics
};

