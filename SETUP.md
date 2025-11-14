# Marathon API Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create MySQL database using the provided schema:

```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL commands from `database/schema.sql` in your MySQL client.

### 3. Environment Configuration

Create a `.env` file in the root directory (copy from `env.template`):

```bash
cp env.template .env
```

**Note:** For detailed WhatsApp Business API setup, see `WHATSAPP_SETUP.md`

Update the following variables in `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=marathon_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Admin Credentials
ADMIN_MOBILE=1234567890
ADMIN_PASSWORD=admin123

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# WhatsApp Business API Configuration
# Get these from Meta Business Suite: https://business.facebook.com/
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_API_VERSION=v22.0
WHATSAPP_BUSINESS_ACCOUNT_ID=
# Message Type Configuration
# Set to 'false' to send plain text messages (only works if user messaged you within 24 hours)
# Set to 'true' or leave empty to use template messages (required for initial messages)
WHATSAPP_USE_TEMPLATE=true
# Template Configuration (only used if WHATSAPP_USE_TEMPLATE=true)
WHATSAPP_TEMPLATE_NAME=hello_world
WHATSAPP_TEMPLATE_LANGUAGE=en_US
# Set to 'true' if your template has parameters for OTP
WHATSAPP_TEMPLATE_HAS_PARAMS=false

# PhonePe Payment Gateway Configuration (using SDK)
# Get these from PhonePe Merchant Dashboard: https://developer.phonepe.com/
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENVIRONMENT=sandbox
# Callback validation credentials (configured in PhonePe dashboard)
PHONEPE_CALLBACK_USERNAME=your_callback_username
PHONEPE_CALLBACK_PASSWORD=your_callback_password

# Base URL
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Access the API

- API Base URL: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

## API Endpoints Overview

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login

### Participant
- `POST /api/participant/marathon/:marathonId/register` - Register for marathon
- `GET /api/participant` - Get user's participants
- `GET /api/participant/:participantId` - Get participant details

### Marathon
- `GET /api/marathon` - Get all marathons
- `GET /api/marathon/:marathonId` - Get marathon details
- `POST /api/marathon` - Create marathon (Admin)
- `PUT /api/marathon/:marathonId` - Update marathon (Admin)
- `DELETE /api/marathon/:marathonId` - Delete marathon (Admin)

### Payment
- `POST /api/payment/create` - Create payment order
- `POST /api/payment/callback` - PhonePe callback
- `GET /api/payment/status/:orderId` - Get payment status

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/participants` - Get participants with filters
- `GET /api/admin/reports/tshirt-size` - T-shirt size report
- `GET /api/admin/reports/payment-statistics` - Payment statistics

### Result
- `GET /api/result` - Get all results
- `GET /api/result/:resultId` - Get result details
- `POST /api/result` - Upload result (Admin)
- `POST /api/result/bulk-upload` - Bulk upload results (Admin)
- `PUT /api/result/:resultId` - Update result (Admin)
- `DELETE /api/result/:resultId` - Delete result (Admin)

## Authentication

### User Authentication (OTP-based)

1. Send OTP:
```bash
POST /api/auth/send-otp
{
  "mobileNumber": "9876543210"
}
```

2. Verify OTP:
```bash
POST /api/auth/verify-otp
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

Response includes JWT token to be used in subsequent requests:
```
Authorization: Bearer <token>
```

### Admin Authentication

Admin endpoints require Basic Authentication:
```
Authorization: Basic base64(mobile:password)
```

Example:
```
Authorization: Basic base64(1234567890:admin123)
```

## Payment Integration (PhonePe)

### Setup

1. Get PhonePe merchant credentials from PhonePe dashboard
2. Update `.env` with PhonePe credentials
3. Set `PHONEPE_ENVIRONMENT` to `sandbox` for testing or `production` for live

### Payment Flow

1. Create payment order:
```bash
POST /api/payment/create
Authorization: Bearer <token>
{
  "participantId": 1,
  "amount": 500.00
}
```

2. Redirect user to `paymentUrl` from response
3. PhonePe will redirect to callback URL after payment
4. Check payment status:
```bash
GET /api/payment/status/:orderId
Authorization: Bearer <token>
```

## WhatsApp OTP Integration

The OTP service is configured to use WhatsApp Business API. 

**For detailed setup instructions, see `WHATSAPP_SETUP.md`**

Quick setup:
1. Get your Phone Number ID and Access Token from Meta Business Suite
2. Add them to `.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ```
3. If credentials are not configured, OTPs will be logged to console in development mode

## Database Schema Changes

If you need to add the OTP column to existing Users table:

```sql
ALTER TABLE Users ADD COLUMN OTP VARCHAR(10) NULL AFTER Mobile_Number;
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `marathon_db` exists

### OTP Not Sending
- Check WhatsApp API credentials
- In development, OTP is logged to console
- Verify phone number format (should be 10 digits)

### Payment Issues
- Verify PhonePe credentials
- Check callback URL is accessible
- Ensure `BASE_URL` in `.env` is correct

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up proper logging
6. Use database migrations instead of `sync()`
7. Configure proper WhatsApp API integration
8. Use production PhonePe credentials

## Notes

- OTP is stored in plain text for development. In production, hash it using bcrypt.
- Admin credentials are managed via environment variables.
- All timestamps are in UTC.
- BIB numbers are auto-generated on participant registration.

