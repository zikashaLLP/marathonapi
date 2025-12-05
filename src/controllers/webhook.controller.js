const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');

// Webhook handler for PhonePe payment notifications
const handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    
    // Extract merchantOrderId from various possible locations in webhook payload
    const merchantOrderId =  req.body.payload.merchantOrderId;

    logger.info('Merchant Order ID:', merchantOrderId);
    logger.info('Full webhook payload:', JSON.stringify(req.body, null, 2));

    // Act on event
    if (event === 'checkout.order.completed') {
      logger.info('Payment success event received');
    } else if (event === 'checkout.order.failed') {
      logger.info('Payment failed event received');
    } else {
      logger.info(`Unknown event type: ${event}`);
    }

    // Verify payment status using merchantOrderId
    // Call verifyPayment for both completed and failed events
    if (merchantOrderId) {
      try {
        const result = await paymentService.verifyPayment(merchantOrderId);
        
        logger.info('Payment verification result:', {
          merchantOrderId: result.orderId,
          paymentStatus: result.paymentStatus,
          state: result.state
        });

        if (result.paymentStatus === 'Success') {
          logger.info('💰 Payment confirmed SUCCESS');
        } else {
          logger.info(`⚠ Payment status: ${result.paymentStatus}`);
        }
      } catch (verifyError) {
        logger.error('Error verifying payment:', verifyError);
        // Don't fail the webhook - return success so PhonePe doesn't retry
      }
    } else {
      logger.warn('No merchantOrderId found in webhook payload');
    }

    // Always return success to PhonePe to acknowledge receipt
    return res.json({ status: 'ok' });

  } catch (error) {
    logger.error('Error in webhook handler:', {
      message: error.message,
      stack: error.stack
    });
    // Return 200 to prevent PhonePe from retrying
    return res.status(HTTP_STATUS.OK).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  handleWebhook
};
