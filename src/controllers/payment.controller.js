const { HTTP_STATUS } = require('../utils/constants');
const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { participantId, amount } = req.body;
    
    const result = await paymentService.createPaymentOrder(
      parseInt(participantId),
      userId,
      parseFloat(amount)
    );
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment order created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in createPayment controller:', error);
    next(error);
  }
};

// Verify payment (used as redirect URL from PhonePe)
const verifyPayment = async (req, res, next) => {
  try {
    const { merchantOrderId } = req.query;
    
    if (!merchantOrderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'MerchantOrderId is required'
      });
    }
    
    // Verify payment status from PhonePe and update database
    const result = await paymentService.verifyPayment(merchantOrderId);
    
    const status = result.state;
    const paymentStatus = result.paymentStatus;
    
    // Return JSON response instead of redirecting
    return res.status(HTTP_STATUS.OK).json({
      success: paymentStatus === 'Success',
      message: paymentStatus === 'Success' ? 'Payment successful' : 'Payment failed',
      data: {
        merchantOrderId: result.orderId,
        paymentStatus: paymentStatus,
        state: status,
        transactionId: result.transactionId,
        payment: result.payment
      }
    });
  } catch (error) {
    logger.error('Error in verifyPayment controller:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  verifyPayment
};

