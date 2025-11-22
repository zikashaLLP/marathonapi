const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config();

// Send ticket information via WhatsApp Business API
const sendTicketWhatsApp = async (mobileNumber, participantData) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    const whatsappApiUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`;
    
    // Format mobile number (remove + and ensure it's in international format)
    const formattedNumber = mobileNumber.startsWith('+') 
      ? mobileNumber.replace('+', '') 
      : `91${mobileNumber}`; // Default to India country code if not provided
    
    const { Full_Name, BIB_Number, Marathon } = participantData;
    
    // Create ticket message
    const ticketMessage = `🎯 *Marathon Registration Confirmation*

Dear ${Full_Name},

Thank you for registering for the marathon!

*Your Registration Details:*
• Name: ${Full_Name}
• BIB Number: *${BIB_Number}*
• Marathon: ${Marathon?.Name || 'N/A'}
• Date: ${Marathon?.Date || 'N/A'}
• Location: ${Marathon?.Location || 'N/A'}
• Reporting Time: ${Marathon?.Reporting_Time || 'N/A'}
• Run Start Time: ${Marathon?.Run_Start_Time || 'N/A'}

Please keep this message for your records. Your BIB number is required on the day of the event.

We look forward to seeing you at the marathon!

Best regards,
Marathon Organizing Committee`;

    // Check if WhatsApp Business API credentials are configured
    if (whatsappPhoneNumberId && whatsappAccessToken) {
      try {
        const payload = {
          messaging_product: 'whatsapp',
          to: formattedNumber,
          type: 'text',
          text: {
            body: ticketMessage
          }
        };
        
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
        
        logger.info(`✅ Ticket WhatsApp sent successfully to ${mobileNumber}. Message ID: ${response.data.messages[0]?.id}`);
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
          logger.warn(`[DEV MODE] WhatsApp API failed, logging message instead`);
          logger.info(`📱 WhatsApp to ${mobileNumber}: ${ticketMessage}`);
          console.log(`\n📱 WhatsApp to ${mobileNumber}:\n${ticketMessage}\n`);
          return true;
        }
        
        // In production, log but don't fail the entire flow
        logger.error(`Failed to send WhatsApp to ${mobileNumber}: ${apiError.message}`);
        return false;
      }
    } else {
      // For development/testing - log message instead of sending
      logger.warn('WhatsApp Business API credentials not configured. Running in DEV MODE.');
      logger.info(`[DEV MODE] WhatsApp to ${mobileNumber}: ${ticketMessage}`);
      console.log(`\n📱 WhatsApp to ${mobileNumber}:\n${ticketMessage}\n`);
      return true;
    }
  } catch (error) {
    logger.error('Error sending ticket via WhatsApp:', error);
    // Don't throw error - WhatsApp failure shouldn't break the flow
    return false;
  }
};

module.exports = {
  sendTicketWhatsApp
};

