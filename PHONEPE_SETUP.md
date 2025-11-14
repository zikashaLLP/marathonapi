# PhonePe Payment Gateway Setup Guide

## Important Configuration Steps

### 1. PhonePe Dashboard Configuration

You **MUST** configure the following in your PhonePe Merchant Dashboard:

#### A. Callback URL (Webhook) - REQUIRED
- **Location**: PhonePe Dashboard → Settings → Callback Configuration / Webhook Settings
- **URL**: `{BASE_URL}/api/payment/callback`
  - **Production**: `https://yourdomain.com/api/payment/callback`
  - **Localhost (if PhonePe allows)**: `http://localhost:3000/api/payment/callback`
  - **Localhost with ngrok (recommended)**: `https://your-ngrok-url.ngrok.io/api/payment/callback`
- **Purpose**: PhonePe sends POST requests (webhooks) here to notify your backend about payment status
- **Authentication**: Configure username and password in dashboard
  - These credentials are used for `PHONEPE_CALLBACK_USERNAME` and `PHONEPE_CALLBACK_PASSWORD` in `.env`
- **Important**: 
  - This is SEPARATE from redirect URL
  - This is a backend webhook endpoint
  - PhonePe calls this automatically after payment
  - You send redirect URL in code, but callback URL must be configured in dashboard
  - **For localhost**: PhonePe may not be able to reach `localhost` - use ngrok or similar tool

#### B. Redirect URL Whitelisting - REQUIRED
- **Location**: PhonePe Dashboard → Settings → Redirect URLs / Allowed Redirect URLs
- **URL**: `{FRONTEND_URL}/payment/status`
  - Example: `https://yourdomain.com/payment/status`
  - For local testing: `http://localhost:3000/payment/status` (if allowed) or use ngrok
- **Purpose**: PhonePe redirects users here after payment completion
- **How it works**:
  1. You send redirect URL in payment request (from code) ✅
  2. BUT PhonePe only redirects if URL is whitelisted in dashboard ✅
  3. Both must match exactly (including http/https, domain, path)
- **Important**: 
  - You send redirect URL in code, but it MUST be whitelisted in dashboard
  - If not whitelisted, PhonePe will NOT redirect (payment stays pending)
  - Multiple URLs can be whitelisted (for dev/staging/production)

### 2. Environment Variables

Add these to your `.env` file:

```env
# PhonePe SDK Configuration
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=sandbox

# Callback credentials (from PhonePe dashboard)
PHONEPE_CALLBACK_USERNAME=your_callback_username
PHONEPE_CALLBACK_PASSWORD=your_callback_password

# URLs
BASE_URL=https://yourdomain.com  # Backend URL for callbacks
FRONTEND_URL=https://yourdomain.com  # Frontend URL for redirects
```

### 3. Payment Flow Explained

**Two Separate URLs:**

1. **Redirect URL** (sent in code, whitelisted in dashboard):
   - You send this in payment request: `StandardCheckoutPayRequest.builder().redirectUrl(...)`
   - PhonePe redirects USER here after payment
   - Must be whitelisted in PhonePe dashboard
   - This is where user lands after payment

2. **Callback URL** (configured only in dashboard):
   - Configured in PhonePe dashboard (not sent in code)
   - PhonePe sends webhook (POST request) to your backend
   - Backend processes payment status update
   - User doesn't see this - it's backend-to-backend

**Complete Flow:**

1. **User initiates payment** → Backend creates order with redirect URL
2. **Backend returns PhonePe checkout URL** → Frontend redirects user
3. **User completes payment** on PhonePe page
4. **PhonePe redirects user** to: `{FRONTEND_URL}/payment/status?merchantOrderId=...` (redirect URL from code)
5. **PhonePe sends callback** (webhook) to: `{BASE_URL}/api/payment/callback` (configured in dashboard)

### 4. Frontend Implementation

Your frontend should handle the redirect:

```javascript
// After payment, PhonePe redirects to:
// {FRONTEND_URL}/payment/status?merchantOrderId=ORDER_123

// In your frontend route handler:
const urlParams = new URLSearchParams(window.location.search);
const merchantOrderId = urlParams.get('merchantOrderId');

// Call your backend API to verify payment status
fetch(`/api/payment/status/${merchantOrderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.data.payment.Payment_Status === 'Success') {
    // Show success page
  } else {
    // Show failure page
  }
});
```

### 5. Step-by-Step Dashboard Configuration

#### How to Configure Redirect URL in PhonePe Dashboard:

1. **Login to PhonePe Merchant Dashboard**
   - Go to: https://merchant.phonepe.com/ or your PhonePe dashboard URL

2. **Navigate to Settings**
   - Look for: "Settings" → "Redirect URLs" or "Allowed Redirect URLs" or "Whitelist URLs"
   - May also be under: "Integration Settings" → "Redirect Configuration"

3. **Add Redirect URL**
   - Click "Add URL" or "Whitelist URL"
   - Enter your redirect URL: `{FRONTEND_URL}/payment/status`
   - Example: `https://yourdomain.com/payment/status`
   - Save the URL

4. **Important Notes**:
   - URL must match EXACTLY (including http/https)
   - You can add multiple URLs (dev, staging, production)
   - For localhost testing, you may need to use ngrok or ask PhonePe support

#### How to Configure Callback URL in PhonePe Dashboard:

1. **Navigate to Callback/Webhook Settings**
   - Look for: "Settings" → "Callback Configuration" or "Webhook Settings"
   - May also be under: "Integration Settings" → "Callback URL"

2. **Set Callback URL**
   - Enter: `{BASE_URL}/api/payment/callback`
   - Example: `https://yourdomain.com/api/payment/callback`

3. **Set Authentication Credentials**
   - Set a username (for `PHONEPE_CALLBACK_USERNAME`)
   - Set a password (for `PHONEPE_CALLBACK_PASSWORD`)
   - These are used to validate webhook requests

4. **Save Configuration**

### 6. Common Issues

#### Issue: Payment shows "Pending" and doesn't redirect
**Solution**: 
- ✅ Check if redirect URL is whitelisted in PhonePe dashboard
- ✅ Verify `FRONTEND_URL` in `.env` matches whitelisted URL exactly
- ✅ Ensure URL format is correct (http vs https, trailing slashes, etc.)
- ✅ For localhost: Use ngrok or check if PhonePe allows localhost in sandbox

#### Issue: Callback not received
**Solution**:
- Verify callback URL is configured in PhonePe dashboard
- Check if `BASE_URL` is accessible from internet (not localhost)
- Verify callback username/password match dashboard configuration
- Check server logs for callback requests

#### Issue: Redirect URL not working
**Solution**:
- Ensure URL is whitelisted in PhonePe dashboard
- Check if URL is accessible (not blocked by firewall)
- Verify URL format matches exactly (including https/http)

### 6. Testing in Sandbox

For sandbox testing:
- Use sandbox credentials from PhonePe
- Set `PHONEPE_ENVIRONMENT=sandbox`
- Use test payment methods provided by PhonePe
- Verify both redirect and callback work

### 7. Production Checklist

Before going live:
- [ ] Update `PHONEPE_ENVIRONMENT=production`
- [ ] Configure production callback URL in dashboard
- [ ] Whitelist production redirect URL
- [ ] Test complete payment flow
- [ ] Verify callback authentication works
- [ ] Monitor logs for any errors

## Support

For PhonePe dashboard access and configuration:
- Visit: https://developer.phonepe.com/
- Merchant Dashboard: https://merchant.phonepe.com/
- Support: Check PhonePe documentation for contact details

