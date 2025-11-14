# Marathon Registration API

A comprehensive Node.js backend API for Marathon registration system with OTP authentication, payment integration, and admin management.

## Features

- ✅ Registration Flow
- ✅ OTP Login via WhatsApp
- ✅ Participant Registration
- ✅ Payment Integration (PhonePe)
- ✅ CRUD for Marathon
- ✅ Admin APIs
- ✅ Result Upload APIs
- ✅ Middleware Auth + RBAC
- ✅ Swagger Documentation

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- PhonePe Payment Gateway
- Swagger/OpenAPI

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `env.template`:
   ```bash
   cp env.template .env
   ```

4. Update `.env` with your configuration:
   - Database credentials
   - JWT secret (use a strong secret in production)
   - Admin credentials
   - WhatsApp Business API credentials (see `WHATSAPP_SETUP.md`)
   - PhonePe payment gateway credentials

5. Run the database migrations (create tables using the provided SQL schema)

6. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

Once the server is running, access Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── validators/      # Input validation
└── utils/           # Utility functions
```

## Environment Variables

See `env.template` for all required environment variables. Copy it to `.env` and update with your values.

**Important:** 
- For WhatsApp OTP setup, see `WHATSAPP_SETUP.md`
- Never commit `.env` file to version control

## License

ISC

