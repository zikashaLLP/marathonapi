const { Op } = require('sequelize');
const User = require('../models/User');
const Participant = require('../models/Participant');
const ParticipantDetails = require('../models/ParticipantDetails');
const Marathon = require('../models/Marathon');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Get all users with pagination
const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (filters.mobileNumber) {
      whereClause.Mobile_Number = { [Op.like]: `%${filters.mobileNumber}%` };
    }
    
    if (filters.isVerified !== undefined) {
      whereClause.Is_Verified = filters.isVerified;
    }
    
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['Created_At', 'DESC']]
    });
    
    return {
      users: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    logger.error('Error in getAllUsers:', error);
    throw error;
  }
};

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
        },
        {
          model: User,
          as: 'User'
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
  getAllUsers,
  getMarathonParticipants,
  getTshirtSizeReport,
  getPaymentStatistics
};

