const Payment = require('../models/Payment');
const Participant = require('../models/Participant');
const { getPhonePeClient, PHONEPE_CONFIG } = require('../config/phonepe');
const { StandardCheckoutPayRequest } = require('pg-sdk-node');
const logger = require('../utils/logger');
const participantService = require('./participant.service');
const emailService = require('./email.service');
const whatsappService = require('./whatsapp.service');
require('dotenv').config();

// Create payment order - handles both single and multiple participants
// participantIds can be a single ID (number) or array of IDs
// If single, amount is the fee for that participant
// If multiple, amount is the total sum of all participants' fees
const createPaymentOrder = async (participantIds, totalAmount) => {
  try {
    // Normalize participantIds to array
    const participantIdsArray = Array.isArray(participantIds) ? participantIds : [participantIds];
    
    // Verify all participants exist and are not already paid
    const participants = await participantService.getParticipantsByIds(participantIdsArray);
    
    if (participants.length !== participantIdsArray.length) {
      throw new Error('One or more participants not found');
    }
    
    // Check if any participant already has payment completed
    const paidParticipants = participants.filter(p => p.Is_Payment_Completed);
    if (paidParticipants.length > 0) {
      throw new Error('One or more participants already have completed payment');
    }
    
    // Generate order ID (same for all participants in this order)
    const merchantOrderId = `ORDER_${Date.now()}`;
    
    // Create payment records for each participant with the same Order_Id
    const payments = [];
    let calculatedTotal = 0;
    
    for (const participant of participants) {
      const participantAmount = participant.Marathon?.Fees_Amount || 0;
      calculatedTotal += parseFloat(participantAmount);
      
      const payment = await Payment.create({
        Order_Id: merchantOrderId,
        Participant_Id: participant.Id,
        Amount: participantAmount,
        Payment_Status: 'Pending'
      });
      payments.push(payment);
    }
    
    // Validate that provided totalAmount matches calculated total
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      throw new Error(`Total amount mismatch. Calculated: ${calculatedTotal}, Provided: ${totalAmount}`);
    }
    
    // Prepare redirect URL
    const redirectUrl = `${process.env.FRONTEND_URL}?merchantOrderId=${merchantOrderId}`;
    
    // Build payment request using PhonePe SDK (total amount for all participants)
    const paymentRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(totalAmount * 100)) // Amount in paise
      .redirectUrl(redirectUrl)
      .build();
    
    // Get PhonePe client and initiate payment
    const client = getPhonePeClient();
    const response = await client.pay(paymentRequest);
    
    if (response && response.redirectUrl) {
      logger.info('PhonePe payment initiated successfully:', {
        merchantOrderId,
        amount: paymentRequest.amount,
        participantCount: participants.length
      });
      
      return {
        success: true,
        paymentUrl: response.redirectUrl,
        orderId: merchantOrderId,
        participantIds: participantIdsArray,
        participantCount: participants.length
      };
    }
    
    throw new Error('Failed to get payment URL from PhonePe');
  } catch (error) {
    logger.error('Error in createPaymentOrder:', {
      message: error.message,
      stack: error.stack
    });
    
    throw error;
  }
};

// Verify payment (called from redirect URL)
// Gets all payment entries with the same Order_Id and updates them all
const verifyPayment = async (merchantOrderId) => {
  try {
    // Find all payment records with this order ID
    const payments = await Payment.findAll({
      where: { Order_Id: merchantOrderId },
      include: [
        { 
          model: Participant, 
          as: 'Participant',
          include: [
            { model: require('../models/ParticipantDetails'), as: 'ParticipantDetails' },
            { model: require('../models/Marathon'), as: 'Marathon' }
          ]
        }
      ]
    });
    
    if (!payments || payments.length === 0) {
      throw new Error('Payment not found');
    }
    
    // Get latest status from PhonePe
    const client = getPhonePeClient();
    const statusResponse = await client.getOrderStatus(merchantOrderId);
    
    // Extract status from PhonePe response
    const state = statusResponse.state;
    const paymentStatus = state === 'COMPLETED' ? 'Success' : 
                         state === 'FAILED' ? 'Failed' : 'Pending';
    
    // Update all payment records with the same status
    for (const payment of payments) {
      payment.Payment_Status = paymentStatus;
      payment.Updated_At = new Date();
      if (statusResponse.paymentDetails && statusResponse.paymentDetails.length > 0) {
        payment.Transaction_Id = statusResponse.paymentDetails[0].transactionId;
      }
      await payment.save();
      
      // Update participant payment status if successful
      if (paymentStatus === 'Success' && payment.Participant) {
        payment.Participant.Is_Payment_Completed = true;
        await payment.Participant.save();
      }
    }
    
    // Send email and WhatsApp notifications if payment successful
    if (paymentStatus === 'Success') {
      for (const payment of payments) {
        if (payment.Participant && payment.Participant.ParticipantDetails) {
          const participantData = {
            Full_Name: payment.Participant.ParticipantDetails.Full_Name,
            BIB_Number: payment.Participant.BIB_Number,
            Marathon: payment.Participant.Marathon
          };
          
          // Send email
          try {
            await emailService.sendTicketEmail(
              payment.Participant.ParticipantDetails.Email,
              participantData
            );
          } catch (emailError) {
            logger.error(`Failed to send email to ${payment.Participant.ParticipantDetails.Email}:`, emailError);
          }
          
          // Send WhatsApp
          try {
            await whatsappService.sendTicketWhatsApp(
              payment.Participant.ParticipantDetails.Contact_Number,
              participantData
            );
          } catch (whatsappError) {
            logger.error(`Failed to send WhatsApp to ${payment.Participant.ParticipantDetails.Contact_Number}:`, whatsappError);
          }
        }
      }
      
      logger.info(`Notifications sent for ${payments.length} participant(s) after successful payment`);
    }
    
    return {
      success: paymentStatus === 'Success',
      paymentStatus,
      state: state,
      payments: payments,
      orderId: merchantOrderId,
      transactionId: payments[0]?.Transaction_Id,
      participantCount: payments.length
    };
  } catch (error) {
    logger.error('Error in verifyPayment:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};
