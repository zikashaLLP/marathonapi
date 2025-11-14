# Project Structure

```
marathonapi/
├── database/
│   └── schema.sql                 # Database schema SQL file
├── logs/                          # Application logs (created at runtime)
│   └── .gitkeep
├── src/
│   ├── config/
│   │   ├── database.js            # Sequelize database configuration
│   │   ├── phonepe.js             # PhonePe payment gateway configuration
│   │   └── swagger.js              # Swagger/OpenAPI documentation config
│   ├── controllers/
│   │   ├── admin.controller.js    # Admin endpoints controller
│   │   ├── auth.controller.js     # Authentication controller
│   │   ├── marathon.controller.js # Marathon CRUD controller
│   │   ├── participant.controller.js # Participant registration controller
│   │   ├── payment.controller.js  # Payment processing controller
│   │   └── result.controller.js   # Result upload controller
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT authentication middleware
│   │   ├── error.middleware.js    # Global error handler
│   │   ├── rbac.middleware.js     # Role-based access control (Admin)
│   │   └── validator.middleware.js # Request validation middleware
│   ├── models/
│   │   ├── index.js               # Models index file
│   │   ├── Marathon.js            # Marathon model
│   │   ├── Participant.js         # Participant model
│   │   ├── ParticipantDetails.js  # Participant details model
│   │   ├── Payment.js             # Payment model
│   │   ├── Result.js              # Result model
│   │   └── User.js                # User model
│   ├── routes/
│   │   ├── admin.routes.js        # Admin routes
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── marathon.routes.js     # Marathon routes
│   │   ├── participant.routes.js # Participant routes
│   │   ├── payment.routes.js      # Payment routes
│   │   └── result.routes.js      # Result routes
│   ├── services/
│   │   ├── admin.service.js       # Admin business logic
│   │   ├── auth.service.js        # Authentication service
│   │   ├── marathon.service.js    # Marathon business logic
│   │   ├── otp.service.js         # OTP generation and sending
│   │   ├── participant.service.js # Participant business logic
│   │   ├── payment.service.js     # Payment processing service
│   │   └── result.service.js     # Result management service
│   ├── utils/
│   │   ├── constants.js           # Application constants
│   │   ├── helpers.js             # Helper functions
│   │   └── logger.js              # Winston logger configuration
│   ├── validators/
│   │   ├── auth.validator.js      # Auth request validators
│   │   ├── marathon.validator.js  # Marathon request validators
│   │   ├── participant.validator.js # Participant request validators
│   │   ├── payment.validator.js   # Payment request validators
│   │   └── result.validator.js    # Result request validators
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server entry point
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── package.json                   # Node.js dependencies and scripts
├── PROJECT_STRUCTURE.md           # This file
├── README.md                      # Project README
└── SETUP.md                       # Setup and installation guide
```

## Architecture Overview

### MVC Pattern
- **Models**: Sequelize ORM models representing database tables
- **Views**: JSON API responses (no views, API-only)
- **Controllers**: Handle HTTP requests and responses

### Service Layer
Business logic is separated into service files for:
- Better code organization
- Reusability
- Easier testing
- Separation of concerns

### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Body Parser**: JSON and URL-encoded body parsing
4. **Morgan**: HTTP request logging
5. **Authentication**: JWT token verification
6. **RBAC**: Role-based access control for admin
7. **Validation**: Request data validation
8. **Error Handling**: Global error handler

### Route Organization
Routes are organized by feature:
- `/api/auth` - Authentication
- `/api/participant` - Participant management
- `/api/marathon` - Marathon CRUD
- `/api/payment` - Payment processing
- `/api/admin` - Admin operations
- `/api/result` - Result management

### Database Models Relationships
```
User (1) ────< (N) Participant
ParticipantDetails (1) ────< (N) Participant
Marathon (1) ────< (N) Participant
Participant (1) ────< (N) Payment
Marathon (1) ────< (N) Result
```

## Key Features

### 1. Authentication Flow
- OTP-based authentication via WhatsApp
- JWT token generation on successful verification
- Token-based authorization for protected routes

### 2. Participant Registration
- User registration for marathons
- Automatic BIB number generation
- Payment integration

### 3. Payment Integration
- PhonePe payment gateway integration
- Payment callback handling
- Payment status tracking

### 4. Admin Features
- User listing with pagination
- Participant filtering and reporting
- T-shirt size count reports
- Payment statistics

### 5. Result Management
- Result upload (single and bulk)
- Result filtering and retrieval
- Admin-only result management

## Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Input Validation**: Express-validator for request validation
3. **SQL Injection Protection**: Sequelize ORM with parameterized queries
4. **CORS Configuration**: Configurable CORS policies
5. **Helmet**: Security headers
6. **Error Handling**: Secure error messages (no stack traces in production)

## API Documentation

Swagger/OpenAPI documentation is available at:
- Development: `http://localhost:3000/api-docs`
- All endpoints are documented with request/response schemas

## Environment Variables

See `.env.example` for all required environment variables.

## Database

- MySQL database
- Sequelize ORM for database operations
- Schema file: `database/schema.sql`
- Models auto-sync in development (disabled in production)

## Logging

- Winston logger for application logging
- Logs stored in `logs/` directory
- Console logging in development
- File logging in production

