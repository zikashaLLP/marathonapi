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

// Process Excel file and import participants
const processExcelImport = async (filePath) => {
  const XLSX = require('xlsx');
  const fs = require('fs');
  const { calculateAge, isValidEmail, isValidPhoneNumber, formatPhoneNumber, getNextAvailableBIBNumber } = require('../utils/helpers');
  const ParticipantDetails = require('../models/ParticipantDetails');
  const Participant = require('../models/Participant');
  const Payment = require('../models/Payment');
  const Marathon = require('../models/Marathon');
  const emailService = require('./email.service');
  const whatsappService = require('./whatsapp.service');
  
  const transaction = await Participant.sequelize.transaction();
  
  try {
    // Read entire Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert entire worksheet to JSON (reads all rows)
    // raw: false converts dates to strings, preserving the format as stored in Excel
    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: '', // Default value for empty cells
      raw: false, // Convert to strings to preserve date formats
      dateNF: 'dd-mm-yyyy' // Date number format hint
    });
    
    logger.info(`Reading Excel file: Found ${data.length} row(s) in sheet "${sheetName}"`);
    
    if (!data || data.length === 0) {
      throw new Error('Excel file is empty or has no data');
    }
    
    // Validation errors
    const validationErrors = [];
    const processedData = [];
    
    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (1 is header, so +2)
      const errors = [];
      
      // Map Excel columns to our fields
      const srNo = row['Sr_No'] || row['Sr.No'] || row['Sr No'];
      const bibNo = row['BIB_NO'] || row['BIB_NO'] || row['BIB No'] || '';
      const name = row['Name'] || '';
      const email = row['Email'] || '';
      const mobileNo = row['Mobile_No'] || row['Mobile No'] || row['Mobile_No'] || '';
      const gender = row['Gender'] || '';
      const city = row['City'] || '';
      const pincode = row['Pincode'] || '';
      const tshirtSize = row['T_Shirt_Size'] || row['T-shirt Size'] || row['Tshirt_Size'] || '';
      // Get birth date - handle different column name variations
      let birthDate = row['Birth_Date'] || row['Birth Date'] || row['Date_of_Birth'] || row['BirthDate'] || '';
      
      // If Excel converted it to a Date object, convert it to string first
      if (birthDate instanceof Date) {
        // Format as DD-MM-YYYY
        const day = String(birthDate.getDate()).padStart(2, '0');
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const year = birthDate.getFullYear();
        birthDate = `${day}-${month}-${year}`;
      } else if (typeof birthDate === 'number' && birthDate > 0) {
        // Excel serial date number - convert to DD-MM-YYYY
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + birthDate * 86400000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        birthDate = `${day}-${month}-${year}`;
      }
      const amount = row['Amount'] || '';
      
      // Validate required fields
      if (!name || name.toString().trim() === '') {
        errors.push('Name is required');
      }
      
      if (!email || email.toString().trim() === '') {
        errors.push('Email is required');
      } else if (!isValidEmail(email.toString().trim())) {
        errors.push('Email is invalid');
      }
      
      if (!mobileNo || mobileNo.toString().trim() === '') {
        errors.push('Mobile No is required');
      } else {
        const formattedPhone = formatPhoneNumber(mobileNo.toString());
        if (!isValidPhoneNumber(formattedPhone)) {
          errors.push('Mobile No is invalid (must be 10 digits starting with 6-9)');
        }
      }
      
      if (!birthDate || (birthDate === null || birthDate === undefined || birthDate === '')) {
        errors.push('Birth Date is required');
      } else {
        // Handle Excel date formats (could be serial number, Date object, or date string)
        let date;
        let birthDateStr;
        
        // Handle different input types from Excel
        if (birthDate instanceof Date) {
          // Excel converted it to a Date object
          date = birthDate;
        } else if (typeof birthDate === 'number') {
          // Excel serial date number
          const excelEpoch = new Date(1899, 11, 30); // Excel epoch is Dec 30, 1899
          date = new Date(excelEpoch.getTime() + birthDate * 86400000);
        } else {
          // String format
          birthDateStr = birthDate.toString().trim();
          
          // Check if it's a numeric string (Excel serial number)
          if (!isNaN(birthDateStr) && parseFloat(birthDateStr) > 0 && !birthDateStr.includes('-') && !birthDateStr.includes('/')) {
            const excelEpoch = new Date(1899, 11, 30);
            date = new Date(excelEpoch.getTime() + parseFloat(birthDateStr) * 86400000);
          } else {
            // Try to parse DD-MM-YYYY or DD/MM/YYYY format explicitly
            const ddMmYyyyPattern = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
            const match = birthDateStr.match(ddMmYyyyPattern);
            
            if (match) {
              // DD-MM-YYYY or DD/MM/YYYY format: day, month, year
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
              const year = parseInt(match[3], 10);
              
              // Validate day and month
              if (day < 1 || day > 31 || month < 0 || month > 11) {
                errors.push('Birth Date is invalid (day or month out of range)');
              } else {
                date = new Date(year, month, day);
                // Check if date is valid (handles cases like Feb 30)
                if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
                  errors.push('Birth Date is invalid (invalid date)');
                }
              }
            } else {
              // Try parsing as regular date (handles other formats like YYYY-MM-DD, etc.)
              date = new Date(birthDateStr);
            }
          }
        }
        
        if (!date || isNaN(date.getTime())) {
          if (!errors.some(e => e.includes('Birth Date is invalid'))) {
            errors.push(`Birth Date is invalid. Received: "${birthDate}". Please use DD-MM-YYYY or DD/MM/YYYY format (e.g., 15-05-1990 or 15/05/1990)`);
          }
        } else {
          // Check if date is not in the future
          if (date > new Date()) {
            errors.push('Birth Date cannot be in the future');
          }
          // Check if date is reasonable (not before 1900)
          if (date.getFullYear() < 1900) {
            errors.push('Birth Date is too old (must be after 1900)');
          }
        }
      }
      
      if (!gender || gender.toString().trim() === '') {
        errors.push('Gender is required');
      } else {
        const validGenders = ['Male', 'Female', 'Other'];
        if (!validGenders.includes(gender.toString().trim())) {
          errors.push(`Gender must be one of: ${validGenders.join(', ')}`);
        }
      }
      
      if (!city || city.toString().trim() === '') {
        errors.push('City is required');
      }
      
      if (!pincode || pincode.toString().trim() === '') {
        errors.push('Pincode is required');
      }
      
      if (!tshirtSize || tshirtSize.toString().trim() === '') {
        errors.push('T-shirt Size is required');
      } else {
        const validSizes = ['XS 34', 'S 36', 'M 38', 'L 40', 'XL 42', 'XXL 44', '3XL 46'];
        if (!validSizes.includes(tshirtSize.toString().trim())) {
          errors.push(`T-shirt Size must be one of: ${validSizes.join(', ')}`);
        }
      }
      
      if (!amount || amount.toString().trim() === '') {
        errors.push('Amount is required');
      } else {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
          errors.push('Amount must be a valid positive number');
        }
      }
      
      if (errors.length > 0) {
        validationErrors.push({
          srNo: srNo || rowNumber,
          rowNumber: rowNumber,
          errors: errors
        });
      } else {
        // Parse birth date properly - handle Date objects, Excel serial numbers, and strings
        let parsedBirthDate;
        
        // Handle different input types from Excel
        if (birthDate instanceof Date) {
          // Excel converted it to a Date object
          parsedBirthDate = birthDate;
        } else if (typeof birthDate === 'number' && birthDate > 0) {
          // Excel serial date number
          const excelEpoch = new Date(1899, 11, 30);
          parsedBirthDate = new Date(excelEpoch.getTime() + birthDate * 86400000);
        } else {
          // String format
          const birthDateStr = birthDate.toString().trim();
          
          // Check if it's a numeric string (Excel serial number)
          if (!isNaN(birthDateStr) && parseFloat(birthDateStr) > 0 && !birthDateStr.includes('-') && !birthDateStr.includes('/')) {
            const excelEpoch = new Date(1899, 11, 30);
            parsedBirthDate = new Date(excelEpoch.getTime() + parseFloat(birthDateStr) * 86400000);
          } else {
            // Try to parse DD-MM-YYYY or DD/MM/YYYY format explicitly
            const ddMmYyyyPattern = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
            const match = birthDateStr.match(ddMmYyyyPattern);
            
            if (match) {
              // DD-MM-YYYY or DD/MM/YYYY format: day, month, year
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
              const year = parseInt(match[3], 10);
              parsedBirthDate = new Date(year, month, day);
            } else {
              // Try parsing as regular date (handles other formats)
              parsedBirthDate = new Date(birthDateStr);
            }
          }
        }
        
        processedData.push({
          srNo: srNo || rowNumber,
          bibNo: bibNo,
          name: name.toString().trim(),
          email: email.toString().trim(),
          mobileNo: formatPhoneNumber(mobileNo.toString()),
          gender: gender.toString().trim(),
          city: city.toString().trim(),
          pincode: pincode.toString().trim(),
          tshirtSize: tshirtSize.toString().trim(),
          birthDate: parsedBirthDate,
          amount: parseFloat(amount)
        });
      }
    });
    
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      await transaction.rollback();
      return {
        success: false,
        errors: validationErrors,
        message: `Validation failed for ${validationErrors.length} row(s)`
      };
    }
    
    // Fetch Marathon data (Id = 1) for notifications
    const marathon = await Marathon.findByPk(1, { transaction });
    if (!marathon) {
      throw new Error('Marathon with ID 1 not found');
    }
    
    // Process all valid rows in transaction
    const resultData = [];
    const createdParticipantIds = [];
    
    for (const participantData of processedData) {
      // Generate BIB Number
      const bibNumber = await getNextAvailableBIBNumber(transaction);
      
      // Calculate age
      const age = calculateAge(participantData.birthDate);
      
      // Format birth date as YYYY-MM-DD for DATEONLY field
      const formattedBirthDate = participantData.birthDate.toISOString().split('T')[0];
      
      // Create ParticipantDetails
      const participantDetails = await ParticipantDetails.create({
        Full_Name: participantData.name,
        Email: participantData.email,
        Contact_Number: participantData.mobileNo,
        Gender: participantData.gender,
        Age: age,
        Address: null,
        City: participantData.city,
        Pincode: participantData.pincode,
        State: null,
        Tshirt_Size: participantData.tshirtSize,
        Date_of_Birth: formattedBirthDate,
        Blood_Group: null,
        Running_Group: null,
        Is_Terms_Condition_Accepted: false
      }, { transaction });
      
      // Create Participant
      const participant = await Participant.create({
        BIB_Number: bibNumber,
        ParticipantDetails_Id: participantDetails.Id,
        Marathon_Id: 1,
        Marathon_Type: 'Open',
        Is_Payment_Completed: true,
        Is_Notified: false
      }, { transaction });
      
      // Create Payment
      await Payment.create({
        Participant_Id: participant.Id,
        Amount: participantData.amount,
        Payment_Status: 'Success',
        Order_Id: null,
        Transaction_Id: null
      }, { transaction });
      
      // Store participant ID for notifications
      createdParticipantIds.push(participant.Id);
      
      // Add to result data
      resultData.push({
        'Sr_No': participantData.srNo,
        'BIB_NO': bibNumber,
        'Name': participantData.name,
        'Email': participantData.email,
        'Mobile_No': participantData.mobileNo,
        'Gender': participantData.gender,
        'City': participantData.city,
        'Pincode': participantData.pincode,
        'T_Shirt_Size': participantData.tshirtSize,
        'Birth_Date': participantData.birthDate.toISOString().split('T')[0],
        'Amount': participantData.amount
      });
    }
    
    await transaction.commit();
    
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    logger.info(`Excel import successful: ${resultData.length} participant(s) imported`);
    
    // Send notifications for all imported participants
    let notificationCount = 0;
    let notificationErrors = [];
    
    if (createdParticipantIds.length > 0) {
      // Fetch all created participants with their details and marathon
      const participants = await Participant.findAll({
        where: { Id: { [Op.in]: createdParticipantIds } },
        include: [
          { model: ParticipantDetails, as: 'ParticipantDetails', required: true },
          { model: Marathon, as: 'Marathon', required: true }
        ]
      });
      
      // Send notifications for each participant
      for (const participant of participants) {
        if (participant.ParticipantDetails && participant.Marathon) {
          const participantData = {
            Full_Name: participant.ParticipantDetails.Full_Name,
            BIB_Number: participant.BIB_Number,
            Marathon: participant.Marathon,
            Tshirt_Size: participant.ParticipantDetails.Tshirt_Size
          };
          
          let emailSent = false;
          let whatsappSent = false;
          
          // Send email
          try {
            emailSent = await emailService.sendTicketEmail(
              participant.ParticipantDetails.Email,
              participantData
            );
          } catch (emailError) {
            logger.error(`Failed to send email to ${participant.ParticipantDetails.Email} (Participant ID: ${participant.Id}):`, emailError);
            notificationErrors.push({
              participantId: participant.Id,
              email: participant.ParticipantDetails.Email,
              error: 'Email sending failed',
              details: emailError.message
            });
          }
          
          // Send WhatsApp
          try {
            whatsappSent = await whatsappService.sendTicketWhatsApp(
              participant.ParticipantDetails.Contact_Number,
              participantData
            );
          } catch (whatsappError) {
            logger.error(`Failed to send WhatsApp to ${participant.ParticipantDetails.Contact_Number} (Participant ID: ${participant.Id}):`, whatsappError);
            notificationErrors.push({
              participantId: participant.Id,
              mobileNo: participant.ParticipantDetails.Contact_Number,
              error: 'WhatsApp sending failed',
              details: whatsappError.message
            });
          }
          
          // Update Is_Notified flag if at least one notification was sent
          if (emailSent || whatsappSent) {
            try {
              participant.Is_Notified = true;
              await participant.save();
              notificationCount++;
              logger.info(`Notifications sent and Is_Notified set to true for participant ${participant.Id}`);
            } catch (updateError) {
              logger.error(`Failed to update Is_Notified for participant ${participant.Id}:`, updateError);
            }
          }
        }
      }
      
      if (notificationCount > 0) {
        logger.info(`Notifications sent for ${notificationCount} participant(s) after Excel import`);
      }
      
      if (notificationErrors.length > 0) {
        logger.warn(`Failed to send notifications for ${notificationErrors.length} participant(s)`);
      }
    }
    
    return {
      success: true,
      data: resultData,
      count: resultData.length,
      message: `Successfully imported ${resultData.length} participant(s)`,
      notificationsSent: notificationCount,
      notificationErrors: notificationErrors.length > 0 ? notificationErrors : undefined
    };
  } catch (error) {
    await transaction.rollback();
    
    // Clean up uploaded file on error
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        logger.error('Error deleting file:', unlinkError);
      }
    }
    
    logger.error('Error in processExcelImport:', error);
    throw error;
  }
};

module.exports = {
  getMarathonParticipants,
  getTshirtSizeReport,
  getPaymentStatistics,
  getParticipantsWithPaymentDetails,
  getParticipantStatisticsByGroup,
  getParticipantStatisticsReport,
  processExcelImport
};

