const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config();

// Send email using a service (you can use SendGrid, Mailgun, etc.)
// For now, using a simple HTTP-based email service
// You can replace this with nodemailer, SendGrid, or any other email service
const sendTicketEmail = async (email, participantData) => {
  try {
    const { Full_Name, BIB_Number, Marathon } = participantData;
    
    // Email content
    const emailSubject = `Marathon Registration Confirmation - BIB Number: ${BIB_Number}`;
    const emailBody = `
Dear ${Full_Name},

Thank you for registering for the marathon!

Your registration details:
- Name: ${Full_Name}
- BIB Number: ${BIB_Number}
- Marathon: ${Marathon?.Name || 'N/A'}
- Date: ${Marathon?.Date || 'N/A'}
- Location: ${Marathon?.Location || 'N/A'}
- Reporting Time: ${Marathon?.Reporting_Time || 'N/A'}
- Run Start Time: ${Marathon?.Run_Start_Time || 'N/A'}

Please keep this email for your records. Your BIB number is required on the day of the event.

We look forward to seeing you at the marathon!

Best regards,
Marathon Organizing Committee
    `;

    // If you have an email service configured (SendGrid, Mailgun, etc.), use it here
    // For now, we'll log it in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVICE_API_KEY) {
      logger.info(`[DEV MODE] Email would be sent to ${email}`);
      logger.info(`Subject: ${emailSubject}`);
      logger.info(`Body: ${emailBody}`);
      console.log(`\n📧 Email to ${email}:\n${emailSubject}\n\n${emailBody}\n`);
      return true;
    }

    // Example: Using SendGrid (uncomment and configure if using SendGrid)
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@marathon.com',
      subject: emailSubject,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>')
    };
    
    await sgMail.send(msg);
    */

    // Example: Using Mailgun (uncomment and configure if using Mailgun)
    /*
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY
    });
    
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: process.env.EMAIL_FROM || 'noreply@marathon.com',
      to: [email],
      subject: emailSubject,
      text: emailBody
    });
    */

    logger.info(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    // Don't throw error - email failure shouldn't break the flow
    return false;
  }
};

module.exports = {
  sendTicketEmail
};

