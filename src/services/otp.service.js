const axios = require('axios');
const { generateOTP } = require('../utils/helpers');
const logger = require('../utils/logger');
require('dotenv').config();

// Send OTP via WhatsApp Business API
const sendOTPToWhatsApp = async (mobileNumber, otp) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    const whatsappApiUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`;
    
    // Format mobile number (remove + and ensure it's in international format)
    const formattedNumber = mobileNumber.startsWith('+') 
      ? mobileNumber.replace('+', '') 
      : `91${mobileNumber}`; // Default to India country code if not provided
    
    // Check if WhatsApp Business API credentials are configured
    if (whatsappPhoneNumberId && whatsappAccessToken) {
      try {
        // Check if user wants to use template or text message
        const useTemplate = process.env.WHATSAPP_USE_TEMPLATE !== 'false'; // Default to true
        const messageType = useTemplate ? 'template' : 'text';
        
        let payload;
        
        if (messageType === 'text') {
          // Send as plain text message (works if user messaged you within 24 hours)
          const message = `Your OTP for Marathon Registration is: *${otp}*. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`;
          
          payload = {
            messaging_product: 'whatsapp',
            to: formattedNumber,
            type: 'text',
            text: {
              body: message
            }
          };
        } else {
          // Use template message (required for initial messages outside 24-hour window)
          const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';
          const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';
          
          payload = {
            messaging_product: 'whatsapp',
            to: formattedNumber,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: templateLanguage
              }
            }
          };
          
          // If using a custom OTP template with parameters, add components
          if (process.env.WHATSAPP_TEMPLATE_HAS_PARAMS === 'true') {
            payload.template.components = [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: otp
                  }
                ]
              }
            ];
          }
        }
        
        const response = await axios.post(
          whatsappApiUrl,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${whatsappAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        logger.info(`✅ OTP sent successfully to ${mobileNumber} via WhatsApp (${messageType}). Message ID: ${response.data.messages[0]?.id}`);
        return true;
      } catch (apiError) {
        logger.error('WhatsApp API Error:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        // If text message fails (outside 24-hour window), try template as fallback
        if (messageType === 'text' && apiError.response?.status === 403) {
          logger.warn('Text message failed (likely outside 24-hour window), trying template message...');
          
          try {
            const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';
            const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';
            
            const templatePayload = {
              messaging_product: 'whatsapp',
              to: formattedNumber,
              type: 'template',
              template: {
                name: templateName,
                language: {
                  code: templateLanguage
                }
              }
            };
            
            if (process.env.WHATSAPP_TEMPLATE_HAS_PARAMS === 'true') {
              templatePayload.template.components = [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: otp
                    }
                  ]
                }
              ];
            }
            
            const fallbackResponse = await axios.post(
              whatsappApiUrl,
              templatePayload,
              {
                headers: {
                  'Authorization': `Bearer ${whatsappAccessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            logger.info(`✅ OTP sent successfully via template (fallback) to ${mobileNumber}. Message ID: ${fallbackResponse.data.messages[0]?.id}`);
            return true;
          } catch (fallbackError) {
            logger.error('Template fallback also failed:', fallbackError.response?.data);
          }
        }
        
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

