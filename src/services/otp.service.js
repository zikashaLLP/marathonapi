const axios = require('axios');
const { generateOTP } = require('../utils/helpers');
const logger = require('../utils/logger');
require('dotenv').config();

// Send OTP via WhatsApp Business API
const sendOTPToWhatsApp = async (mobileNumber, otp) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    const whatsappApiUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`;
    
    // Format mobile number (remove + and ensure it's in international format)
    const formattedNumber = mobileNumber.startsWith('+') 
      ? mobileNumber.replace('+', '') 
      : `91${mobileNumber}`; // Default to India country code if not provided
    
    const message = `Your OTP for Marathon Registration is: *${otp}*. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`;
    
    // Check if WhatsApp Business API credentials are configured
    if (whatsappPhoneNumberId && whatsappAccessToken) {
      try {
        const response = await axios.post(
          whatsappApiUrl,
          {
            messaging_product: 'whatsapp',
            to: formattedNumber,
            type: 'text',
            text: {
              body: message
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${whatsappAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        logger.info(`✅ OTP sent successfully to ${mobileNumber} via WhatsApp. Message ID: ${response.data.messages[0]?.id}`);
        return true;
      } catch (apiError) {
        logger.error('WhatsApp API Error:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        // If API fails, log for development but don't throw error
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`[DEV MODE] WhatsApp API failed, logging OTP instead`);
          logger.info(`📱 OTP for ${mobileNumber}: ${otp}`);
          console.log(`\n📱 OTP for ${mobileNumber}: ${otp}\n`);
          return true;
        }
        
        throw new Error(`WhatsApp API error: ${apiError.response?.data?.error?.message || apiError.message}`);
      }
    } else {
      // For development/testing - log OTP instead of sending
      logger.warn('WhatsApp Business API credentials not configured. Running in DEV MODE.');
      logger.info(`[DEV MODE] OTP for ${mobileNumber}: ${otp}`);
      console.log(`\n📱 OTP for ${mobileNumber}: ${otp}\n`);
      return true;
    }
  } catch (error) {
    logger.error('Error sending OTP via WhatsApp:', error);
    throw new Error('Failed to send OTP');
  }
};

// Generate and send OTP
const generateAndSendOTP = async (mobileNumber) => {
  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10));
  
  await sendOTPToWhatsApp(mobileNumber, otp);
  
  return {
    otp,
    otpExpiry
  };
};

// Verify OTP (stored in database)
const verifyOTP = async (storedOTPTimestamp, otpExpiryMinutes = 10) => {
  if (!storedOTPTimestamp) {
    return false;
  }
  
  const now = new Date();
  const expiryTime = new Date(storedOTPTimestamp);
  expiryTime.setMinutes(expiryTime.getMinutes() + otpExpiryMinutes);
  
  return now <= expiryTime;
};

module.exports = {
  generateAndSendOTP,
  verifyOTP,
  sendOTPToWhatsApp
};

