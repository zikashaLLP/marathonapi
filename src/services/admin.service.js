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
    const whereClause = { Is_Payment_Completed: true };
    
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
      'XS 34': 0,
      'S 36': 0,
      'M 38': 0,
      'L 40': 0,
      'XL 42': 0,
      'XXL 44': 0,
      '3XL 46': 0,
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

// Get participants with payment details
const getParticipantsWithPaymentDetails = async (paymentStatus = 'all') => {
  try {
    const whereClause = {};
    
    // Filter by payment status
    if (paymentStatus === 'Completed') {
      whereClause.Is_Payment_Completed = true;
    }
    // If paymentStatus is 'all', no filter is applied
    
    const participants = await Participant.findAll({
      where: whereClause,
      include: [
        {
          model: ParticipantDetails,
          as: 'ParticipantDetails',
          required: true
        },
        {
          model: Payment,
          as: 'Payments',
          required: false,
          separate: true,
          order: [['Updated_At', 'DESC']]
        }
      ],
      order: [['Created_At', 'DESC']]
    });
    
    // Format the response with all required fields
    const formattedParticipants = participants.map((participant, index) => {
      // Get the most recent successful payment
      const successfulPayments = participant.Payments 
        ? participant.Payments.filter(p => p.Payment_Status === 'Success')
        : [];
      const successfulPayment = successfulPayments.length > 0 ? successfulPayments[0] : null;
      
      return {
        'Sr.No': index + 1,
        'Name': participant.ParticipantDetails?.Full_Name || '',
        'Email': participant.ParticipantDetails?.Email || '',
        'Mobile No': participant.ParticipantDetails?.Contact_Number || '',
        'Gender': participant.ParticipantDetails?.Gender || '',
        'City': participant.ParticipantDetails?.City || '',
        'Pincode': participant.ParticipantDetails?.Pincode || '',
        'T-shirt Size': participant.ParticipantDetails?.Tshirt_Size || '',
        'Birth Date': participant.ParticipantDetails?.Date_of_Birth || '',
        'Payment Status': participant.Is_Payment_Completed ? 'Completed' : 'Pending',
        'Payment Date': successfulPayment ? successfulPayment.Updated_At : null
      };
    });
    
    return formattedParticipants;
  } catch (error) {
    logger.error('Error in getParticipantsWithPaymentDetails:', error);
    throw error;
  }
};

// Calculate age from date of birth as of a specific date (December 1, 2025)
const calculateAgeAsOfDate = (dateOfBirth, referenceDate) => {
  const refDate = new Date(referenceDate);
  const birthDate = new Date(dateOfBirth);
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get participant statistics grouped by gender and age
const getParticipantStatisticsByGroup = async (gender = 'All', minAge = null, maxAge = null) => {
  try {
    const whereClause = {
      Is_Payment_Completed: true
    };
    
    const participantDetailsWhere = {};
    
    // Filter by gender
    if (gender !== 'All') {
      participantDetailsWhere.Gender = gender;
    } else {
      // If gender is 'All', include Male, Female, and Other
      participantDetailsWhere.Gender = { [Op.in]: ['Male', 'Female', 'Other'] };
    }
    
    // Reference date: December 1, 2025
    const referenceDate = new Date('2025-12-01');
    
    // Get all participants with payment completed and gender filter applied
    // Note: Age filtering will be done in JavaScript after calculating age from Date_of_Birth
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
          model: Payment,
          as: 'Payments',
          required: false,
          separate: true,
          order: [['Updated_At', 'DESC']]
        }
      ],
      order: [['Created_At', 'DESC']]
    });
    
    // Filter participants by calculated age
    const filteredParticipants = participants.filter(participant => {
      if (!participant.ParticipantDetails?.Date_of_Birth) {
        return false;
      }
      
      // Calculate age as of December 1, 2025
      const calculatedAge = calculateAgeAsOfDate(
        participant.ParticipantDetails.Date_of_Birth,
        referenceDate
      );
      
      // Apply age filters
      if (minAge !== null && maxAge !== null) {
        return calculatedAge >= parseInt(minAge) && calculatedAge <= parseInt(maxAge);
      } else if (minAge !== null) {
        return calculatedAge >= parseInt(minAge);
      } else if (maxAge !== null) {
        return calculatedAge <= parseInt(maxAge);
      }
      
      // If no age filter, include all
      return true;
    });
    
    // Format the response with all required fields (same format as getParticipantsWithPaymentDetails)
    const formattedParticipants = filteredParticipants.map((participant, index) => {
      // Get the most recent successful payment
      const successfulPayments = participant.Payments 
        ? participant.Payments.filter(p => p.Payment_Status === 'Success')
        : [];
      const successfulPayment = successfulPayments.length > 0 ? successfulPayments[0] : null;
      
      return {
        'Sr.No': index + 1,
        'BIB Number': participant.BIB_Number || '',
        'Name': participant.ParticipantDetails?.Full_Name || '',
        'Email': participant.ParticipantDetails?.Email || '',
        'Mobile No': participant.ParticipantDetails?.Contact_Number || '',
        'Gender': participant.ParticipantDetails?.Gender || '',
        'City': participant.ParticipantDetails?.City || '',
        'Pincode': participant.ParticipantDetails?.Pincode || '',
        'T-shirt Size': participant.ParticipantDetails?.Tshirt_Size || '',
        'Birth Date': participant.ParticipantDetails?.Date_of_Birth || '',
        'Payment Status': participant.Is_Payment_Completed ? 'Completed' : 'Pending',
        'Payment Date': successfulPayment ? successfulPayment.Updated_At : null
      };
    });
    
    return formattedParticipants;
  } catch (error) {
    logger.error('Error in getParticipantStatisticsByGroup:', error);
    throw error;
  }
};

// Get participant statistics report grouped by gender and age with t-shirt size breakdown
const getParticipantStatisticsReport = async () => {
  try {
    // Reference date: December 1, 2025
    const referenceDate = new Date('2025-12-01');
    
    // Get all participants with payment completed
    const participants = await Participant.findAll({
      where: {
        Is_Payment_Completed: true
      },
      include: [
        {
          model: ParticipantDetails,
          as: 'ParticipantDetails',
          required: true
        }
      ]
    });
    
    // Initialize t-shirt size counts
    const initializeSizeCount = () => ({
      'XS 34': 0,
      'S 36': 0,
      'M 38': 0,
      'L 40': 0,
      'XL 42': 0,
      'XXL 44': 0,
      '3XL 46': 0
    });
    
    // Initialize groups
    const womenGroup = {
      groupName: 'Women',
      participantCount: 0,
      tshirtSizes: initializeSizeCount()
    };
    
    const menGroupA = {
      groupName: 'Men Group A - Age upto 30',
      participantCount: 0,
      tshirtSizes: initializeSizeCount()
    };
    
    const menGroupB = {
      groupName: 'Men Group B - Age 31 to 45',
      participantCount: 0,
      tshirtSizes: initializeSizeCount()
    };
    
    const menGroupC = {
      groupName: 'Men Group C - Age above 45',
      participantCount: 0,
      tshirtSizes: initializeSizeCount()
    };
    
    // Process each participant
    participants.forEach(participant => {
      const details = participant.ParticipantDetails;
      if (!details || !details.Date_of_Birth) return;
      
      const gender = details.Gender;
      // Calculate age as of December 1, 2025
      const age = calculateAgeAsOfDate(details.Date_of_Birth, referenceDate);
      const tshirtSize = details.Tshirt_Size;
      
      // Women group
      if (gender === 'Female') {
        womenGroup.participantCount++;
        if (tshirtSize && womenGroup.tshirtSizes.hasOwnProperty(tshirtSize)) {
          womenGroup.tshirtSizes[tshirtSize]++;
        }
      }
      // Men groups
      else if (gender === 'Male') {
        if (age <= 30) {
          menGroupA.participantCount++;
          if (tshirtSize && menGroupA.tshirtSizes.hasOwnProperty(tshirtSize)) {
            menGroupA.tshirtSizes[tshirtSize]++;
          }
        } else if (age >= 31 && age <= 45) {
          menGroupB.participantCount++;
          if (tshirtSize && menGroupB.tshirtSizes.hasOwnProperty(tshirtSize)) {
            menGroupB.tshirtSizes[tshirtSize]++;
          }
        } else if (age > 45) {
          menGroupC.participantCount++;
          if (tshirtSize && menGroupC.tshirtSizes.hasOwnProperty(tshirtSize)) {
            menGroupC.tshirtSizes[tshirtSize]++;
          }
        }
      }
    });
    
    return {
      'Women': womenGroup,
      'Men Group A - Age upto 30': menGroupA,
      'Men Group B - Age 31 to 45': menGroupB,
      'Men Group C - Age above 45': menGroupC
    };
  } catch (error) {
    logger.error('Error in getParticipantStatisticsReport:', error);
    throw error;
  }
};

module.exports = {
  getMarathonParticipants,
  getTshirtSizeReport,
  getPaymentStatistics,
  getParticipantsWithPaymentDetails,
  getParticipantStatisticsByGroup,
  getParticipantStatisticsReport
};

