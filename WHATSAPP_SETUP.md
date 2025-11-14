# WhatsApp Business API Setup Guide

This guide will help you set up WhatsApp Business API for sending OTP messages.

## Prerequisites

1. A Meta Business Account
2. A WhatsApp Business Account
3. A verified phone number for WhatsApp Business

## Step-by-Step Setup

### 1. Create Meta Business Account

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Create a new business account or use an existing one
3. Complete the business verification process

### 2. Set Up WhatsApp Business Account

1. In Meta Business Suite, go to **WhatsApp** > **API Setup**
2. Follow the setup wizard to create a WhatsApp Business Account
3. Verify your business phone number

### 3. Get Phone Number ID

1. In Meta Business Suite, go to **WhatsApp** > **API Setup**
2. Find your **Phone Number ID** (it's a long numeric ID)
3. Copy this ID and add it to `.env` as `WHATSAPP_PHONE_NUMBER_ID`

### 4. Generate Access Token

#### Option A: Using System User (Recommended for Production)

1. In Meta Business Suite, go to **Business Settings** > **Users** > **System Users**
2. Create a new System User or use an existing one
3. Assign the System User to your WhatsApp Business Account
4. Generate a token:
   - Click on the System User
   - Click **Generate New Token**
   - Select your WhatsApp Business Account
   - Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Copy the token and add it to `.env` as `WHATSAPP_ACCESS_TOKEN`

#### Option B: Using Temporary Access Token (For Testing)

1. In Meta Business Suite, go to **WhatsApp** > **API Setup**
2. Find **Temporary Access Token**
3. Copy the token (valid for 24 hours)
4. Add it to `.env` as `WHATSAPP_ACCESS_TOKEN`

**Note:** Temporary tokens expire quickly. Use System User tokens for production.

### 5. Configure Environment Variables

Update your `.env` file with the following:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABwzLix...your_token_here
WHATSAPP_API_VERSION=v22.0
WHATSAPP_TEMPLATE_NAME=hello_world
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_TEMPLATE_HAS_PARAMS=false
```

### 6. Test the Integration

1. Start your server: `npm run dev`
2. Send an OTP request:
   ```bash
   POST http://localhost:3000/api/auth/send-otp
   {
     "mobileNumber": "9876543210"
   }
   ```
3. Check the logs to see if the message was sent successfully
4. Verify the OTP is received on the WhatsApp number

## API Version

The default API version is `v22.0`. You can check the latest version at:
- [Meta Graph API Changelog](https://developers.facebook.com/docs/graph-api/changelog)

Update `WHATSAPP_API_VERSION` in `.env` if you need a different version.

## Message Format

The OTP is sent using WhatsApp message templates. By default, it uses the `hello_world` template for testing.

**For Production:**
1. Create a custom OTP template in Meta Business Suite
2. Get it approved by Meta
3. Update `.env`:
   ```env
   WHATSAPP_TEMPLATE_NAME=your_otp_template_name
   WHATSAPP_TEMPLATE_HAS_PARAMS=true
   ```

**Template with OTP Parameter:**
If your template includes a parameter for the OTP value, set `WHATSAPP_TEMPLATE_HAS_PARAMS=true` and the OTP will be passed as a template parameter.

## Troubleshooting

### Error: Invalid OAuth Access Token

**Solution:**
- Verify your access token is valid and not expired
- Regenerate the token if it's a temporary token
- Check that the token has the correct permissions

### Error: Invalid Phone Number

**Solution:**
- Ensure the phone number is in international format (without +)
- For Indian numbers, use format: `91XXXXXXXXXX` (without +)
- Verify the phone number is registered with WhatsApp

### Error: Message Template Not Approved

**Solution:**
- For production, you need to use approved message templates
- For testing, you can send free-form messages to numbers that have messaged you first
- Submit message templates for approval in Meta Business Suite

### Error: Rate Limit Exceeded

**Solution:**
- WhatsApp Business API has rate limits
- Check your current tier in Meta Business Suite
- Implement rate limiting in your application
- Consider upgrading your WhatsApp Business Account tier

### Testing Without WhatsApp API

If you don't have WhatsApp Business API set up yet:
1. Leave `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` empty in `.env`
2. The system will log OTPs to console in development mode
3. Check server logs for the OTP value

## Production Considerations

1. **Use System User Tokens**: Don't use temporary tokens in production
2. **Message Templates**: For production, create and get approval for message templates
3. **Error Handling**: Implement proper error handling and retry logic
4. **Rate Limiting**: Be aware of WhatsApp API rate limits
5. **Webhooks**: Set up webhooks to receive delivery status updates
6. **Monitoring**: Monitor API usage and errors

## WhatsApp Business API Documentation

- [Official Documentation](https://developers.facebook.com/docs/whatsapp)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

## Support

For issues with WhatsApp Business API:
- Check [Meta Business Help Center](https://www.facebook.com/business/help)
- Review [WhatsApp Business API Status](https://developers.facebook.com/status/whatsapp/)

