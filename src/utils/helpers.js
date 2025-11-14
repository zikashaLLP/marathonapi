// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate BIB Number
const generateBIBNumber = (marathonId, participantId) => {
  const timestamp = Date.now().toString().slice(-6);
  return `MAR${marathonId.toString().padStart(3, '0')}${participantId.toString().padStart(4, '0')}${timestamp}`;
};

// Format phone number
const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(formatPhoneNumber(phone));
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  generateOTP,
  generateBIBNumber,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  calculateAge
};

