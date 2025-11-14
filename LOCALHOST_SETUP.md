# Localhost Testing Setup for PhonePe

## Localhost Callback URL

### For Local Development:

**Callback URL (Webhook):**
```
http://localhost:3000/api/payment/callback
```

**Redirect URL:**
```
http://localhost:3000/payment/status
```

## Important Notes for Localhost

### ⚠️ PhonePe Cannot Reach Localhost Directly

PhonePe's servers **cannot** access `localhost` URLs because:
- `localhost` is only accessible on your local machine
- PhonePe servers are on the internet and can't reach your local machine

### Solution: Use ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm: npm install -g ngrok
   ```

2. **Start your backend server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

3. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **You'll get a public URL like:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Use ngrok URL in PhonePe Dashboard:**
   - **Callback URL**: `https://abc123.ngrok.io/api/payment/callback`
   - **Redirect URL**: `https://abc123.ngrok.io/payment/status` (if needed)

6. **Update your `.env`:**
   ```env
   BASE_URL=https://abc123.ngrok.io
   FRONTEND_URL=https://abc123.ngrok.io
   ```

### Alternative: Use Your Public IP (Not Recommended)

If PhonePe allows it, you can use your public IP:
- **Callback URL**: `http://YOUR_PUBLIC_IP:3000/api/payment/callback`
- Requires port forwarding and firewall configuration
- Less secure and not recommended

## Complete Localhost Configuration

### 1. Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# PhonePe SDK
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=sandbox

# Callback credentials (from PhonePe dashboard)
PHONEPE_CALLBACK_USERNAME=your_callback_username
PHONEPE_CALLBACK_PASSWORD=your_callback_password

# URLs - Use ngrok URL for localhost
BASE_URL=https://your-ngrok-url.ngrok.io  # or http://localhost:3000 if PhonePe allows
FRONTEND_URL=https://your-ngrok-url.ngrok.io  # or http://localhost:3000
```

### 2. PhonePe Dashboard Configuration

**Callback URL:**
- If using ngrok: `https://your-ngrok-url.ngrok.io/api/payment/callback`
- If PhonePe allows localhost: `http://localhost:3000/api/payment/callback`

**Redirect URL (whitelist):**
- If using ngrok: `https://your-ngrok-url.ngrok.io/payment/status`
- If PhonePe allows localhost: `http://localhost:3000/payment/status`

### 3. Testing Flow

1. Start backend: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Copy ngrok URL and update PhonePe dashboard
4. Update `.env` with ngrok URL
5. Test payment flow

## Quick Reference

| Type | Localhost URL | ngrok URL |
|------|---------------|-----------|
| **Callback URL** | `http://localhost:3000/api/payment/callback` | `https://abc123.ngrok.io/api/payment/callback` |
| **Redirect URL** | `http://localhost:3000/payment/status` | `https://abc123.ngrok.io/payment/status` |
| **Backend API** | `http://localhost:3000` | `https://abc123.ngrok.io` |

## Troubleshooting

### Issue: Callback not received
- ✅ Check if ngrok is running
- ✅ Verify ngrok URL is accessible (open in browser)
- ✅ Ensure callback URL in dashboard matches ngrok URL exactly
- ✅ Check ngrok web interface: http://localhost:4040 (shows all requests)

### Issue: ngrok URL changes
- Free ngrok URLs change on restart
- Solution: Use ngrok paid plan for static URLs, or update dashboard each time

### Issue: PhonePe doesn't allow localhost
- Use ngrok (recommended)
- Or deploy to a staging server
- Or contact PhonePe support for localhost testing access

