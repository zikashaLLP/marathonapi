const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

// Create email HTML template
const getEmailTemplate = (participantData) => {
  const { Full_Name, BIB_Number, Marathon } = participantData;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Registration Confirmed!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${Full_Name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Your registration for <strong>Visnagar Marathon 2025 – Run for Cervical Cancer Awareness</strong> is successfully confirmed.
                            </p>
                            
                            <!-- BIB Number Highlight -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Bib/Confirmation Number</p>
                                <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${BIB_Number || 'N/A'}</p>
                            </div>
                            
                            <!-- Event Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333; font-size: 14px;">Event Date:</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                                        <span style="color: #666666; font-size: 14px;">${formatDate(Marathon?.Date)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333; font-size: 14px;">Event Venue:</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                                        <span style="color: #666666; font-size: 14px;">${Marathon?.Location || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333; font-size: 14px;">Reporting Time:</strong>
                                    </td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                                        <span style="color: #666666; font-size: 14px;">${formatTime(Marathon?.Reporting_Time)}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Stay prepared and keep training.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                We look forward to seeing you at the event.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                <strong>Marathon Organizing Committee</strong>
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                Please keep this email for your records. Your BIB number is required on the day of the event.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }
  
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };
  
  // If SMTP is not configured, return null
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    return null;
  }
  
  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
};

const sendTicketEmail = async (email, participantData) => {
  try {
    const { Full_Name, BIB_Number, Marathon } = participantData;
    
    const emailSubject = `Registration Confirmed - Visnagar Marathon 2025 | BIB: ${BIB_Number}`;
    const htmlContent = getEmailTemplate(participantData);
    
    // Plain text version for email clients that don't support HTML
    const textContent = `
Hi ${Full_Name},

Your registration for Visnagar Marathon 2025 – Run for Cervical Cancer Awareness is successfully confirmed.

Bib/Confirmation Number: ${BIB_Number}

Event Date: ${Marathon?.Date || 'N/A'}
Event Venue: ${Marathon?.Location || 'N/A'}
Reporting Time: ${Marathon?.Reporting_Time || 'N/A'}

Stay prepared and keep training.

We look forward to seeing you at the event.

Best regards,
Marathon Organizing Committee
    `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    };
    
    const emailTransporter = getTransporter();
    
    if (!emailTransporter) {
      // Development mode - log email instead of sending
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[DEV MODE] Email would be sent to ${email}`);
        logger.info(`Subject: ${emailSubject}`);
        console.log(`\n📧 Email to ${email}:\n${emailSubject}\n\n${textContent}\n`);
        return true;
      }
      
      logger.error('SMTP configuration not found. Email not sent.');
      return false;
    }
    
    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
    
  } catch (error) {
    logger.error('Error sending email:', {
      message: error.message,
      email: email,
      error: error.response || error
    });
    return false;
  }
};

module.exports = {
  sendTicketEmail
};
