const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config();

const sendTicketWhatsApp = async (mobileNumber, participantData) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    const whatsappApiUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`;
    
    const formattedNumber = mobileNumber.trim();
    const { Full_Name, BIB_Number, Marathon } = participantData;
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      } catch (error) {
        return dateString;
      }
    };
    
    const formatTime = (timeString) => {
      if (!timeString) return 'N/A';
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      } catch (error) {
        return timeString;
      }
    };
    
    const templateParams = [
      Full_Name || 'Participant',
      BIB_Number || 'N/A',
      formatDate(Marathon?.Date),
      Marathon?.Location || 'N/A',
      formatTime(Marathon?.Reporting_Time)
    ];
    
    if (!whatsappPhoneNumberId || !whatsappAccessToken) {
      logger.error('WhatsApp Business API credentials not configured');
      return false;
    }
    
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedNumber,
      type: 'template',
      template: {
        name: 'registration_confirmation',
        language: {
          code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en'
        },
        components: [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ]
      }
    };
    
    try {
      const response = await axios.post(whatsappApiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${whatsappAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.messages?.[0]) {
        const message = response.data.messages[0];
        const messageStatus = message.message_status;
        const successStatuses = ['accepted', 'sent', 'delivered'];
        
        if (messageStatus && successStatuses.includes(messageStatus.toLowerCase())) {
          return true;
        }
        
        if (message.id) {
          return true;
        }
      }
      
      return false;
    } catch (apiError) {
      logger.error('WhatsApp API Error:', {
        status: apiError.response?.status,
        message: apiError.message,
        error: apiError.response?.data?.error
      });
      return false;
    }
  } catch (error) {
    logger.error('Error sending ticket via WhatsApp:', error.message);
    return false;
  }
};

module.exports = {
  sendTicketWhatsApp
};

