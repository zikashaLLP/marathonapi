const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

// Upload PDF to WhatsApp and get media ID
const uploadMediaToWhatsApp = async (filePath) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    const mediaUploadUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/media`;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`PDF file not found at path: ${filePath}`);
      return null;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'document');
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(mediaUploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${whatsappAccessToken}`,
        ...formData.getHeaders()
      }
    });
    
    if (response.data?.id) {
      logger.info(`PDF uploaded successfully. Media ID: ${response.data.id}`);
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    logger.error('Error uploading PDF to WhatsApp:', {
      message: error.message,
      status: error.response?.status,
      error: error.response?.data?.error
    });
    return null;
  }
};

const sendTicketWhatsApp = async (mobileNumber, participantData) => {
  try {
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    const whatsappApiUrl = `https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`;
    
    const formattedNumber = mobileNumber.trim();
    const { Full_Name, BIB_Number, Marathon, Tshirt_Size } = participantData;
    
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
    
    // Template parameters matching the template structure:
    // {{1}} = Full_Name
    // {{2}} = BIB_Number
    // {{3}} = Tshirt_Size
    // {{4}} = Event Date
    // {{5}} = Event Venue
    // {{6}} = Reporting Time
    const templateParams = [
      Full_Name || 'Participant',
      BIB_Number || 'N/A',
      Tshirt_Size || 'N/A',
      formatDate(Marathon?.Date),
      Marathon?.Location || 'N/A',
      formatTime(Marathon?.Reporting_Time)
    ];
    
    if (!whatsappPhoneNumberId || !whatsappAccessToken) {
      logger.error('WhatsApp Business API credentials not configured');
      return false;
    }
    
    // Upload PDF and get media ID
    const pdfPath = path.join(__dirname, '../../public/Race Announcement (1) - Visnagar Marathon 2025.pdf');
    const mediaId = await uploadMediaToWhatsApp(pdfPath);
    
    // Build template components
    const components = [];
    
    // Add header component with PDF document if media upload successful
    if (mediaId) {
      components.push({
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              id: mediaId,
              filename: 'Race Announcement - Visnagar Marathon 2025.pdf'
            }
          }
        ]
      });
      logger.info('PDF attachment added to WhatsApp message');
    } else {
      logger.warn('PDF upload failed, sending WhatsApp message without attachment. Template may fail if it requires media header.');
    }
    
    // Add body component with template parameters
    components.push({
      type: 'body',
      parameters: templateParams.map(param => ({
        type: 'text',
        text: param
      }))
    });
    
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedNumber,
      type: 'template',
      template: {
        name: 'registration_confirmation_with_media',
        language: {
          code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en'
        },
        components: components
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

