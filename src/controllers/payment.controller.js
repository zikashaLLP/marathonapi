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
      return res.status(HTTP_STATUS.BAD_REQUEST).send('MerchantOrderId is required');
    }
    
    // Verify payment status from PhonePe and update database
    const result = await paymentService.verifyPayment(merchantOrderId);
    
    const status = result.state;
    const paymentStatus = result.paymentStatus;
    
    // Build redirect URLs
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const successUrl = `${frontendUrl}/payment/success?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
    const failureUrl = `${frontendUrl}/payment/failed?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
    
    // Redirect based on status
    if (status === 'COMPLETED' || paymentStatus === 'Success') {
      return res.redirect(successUrl);
    } else {
      return res.redirect(failureUrl);
    }
  } catch (error) {
    logger.error('Error in verifyPayment controller:', error);
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return res.redirect(`${frontendUrl}/payment/failed?error=verification_failed`);
  }
};

module.exports = {
  createPayment,
  verifyPayment
};

