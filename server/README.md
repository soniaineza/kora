# Kora — Africa's Talking Integration

Production-ready SMS communication layer for the Kora driving exam platform.

## Overview

This module adds a complete Africa's Talking integration to the Kora backend, covering:

- **OTP authentication** (send + verify) with hashed codes, expiry, attempt limits, and rate limiting
- **Reusable SMS service** for OTP, welcome, payment confirmations, lesson/exam reminders, and result notifications
- **Notification module** that persists every outbound message in the database
- **Modular architecture** following clean-code principles (controllers, services, models, middleware, routes)

## Quick Start

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Server starts on `http://localhost:5001`.

## Environment Variables

See [Environment Setup](docs/ENVIRONMENT.md) for the full list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service role key (prod) |
| `JWT_SECRET` | yes | JWT signing secret (prod) |
| `AFRICASTALKING_USERNAME` | no* | AT username (use `sandbox` for sandbox) |
| `AFRICASTALKING_API_KEY` | no* | AT API key |
| `AFRICASTALKING_SENDER_ID` | no | Registered sender ID / shortcode |
| `NODE_ENV` | no | `development` \| `production` \| `test` |

\* Required for production SMS delivery. In non-production, OTP codes are returned in the response (`devCode`) so you can test without an AT account.

## API Endpoints

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/send-otp` | Send a 6-digit OTP via SMS |
| `POST` | `/api/auth/verify-otp` | Verify OTP, return JWT + user profile |

### Legacy OTP (public, kept for web frontend)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/otp/send` | Send OTP (returns `devCode` in dev) |
| `POST` | `/api/otp/verify` | Verify OTP (returns JWT) |

### SMS (protected)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/sms/send` | Send a custom SMS |
| `GET` | `/api/sms/logs` | List SMS history |

### Notifications (protected)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/notifications/send` | Send a typed notification (welcome, payment, reminder, result) |
| `GET` | `/api/notifications` | List caller's notifications |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health check |

## Database Schema

Run the migration in [migrations/001_initial_schema.sql](migrations/001_initial_schema.sql) against your Supabase project. It creates:

- `users` — one row per verified phone
- `otp_codes` — hashed OTPs with expiry/attempts
- `sms_logs` — every SMS attempt (success/failure)
- `notifications` — high-level business notifications

All tables have appropriate indexes and RLS enabled (service role bypasses).

## Testing

```bash
# Unit + integration tests (requires Node 20+)
npm test
```

The test suite uses an in-memory fake Supabase and a mocked Africa's Talking client — no external dependencies.

See [Testing Guide](docs/TESTING.md) for details.

## Deployment

The app runs on any Node.js host (Render, Fly.io, Railway, etc.). See [Deployment Guide](docs/DEPLOYMENT.md).

## Architecture

```
server/
├── app.js                 # Express app assembly
├── index.js               # Boot script (listen + graceful shutdown)
├── config/env.js          # Environment loading + validation
├── database/supabase.js   # Supabase client (swappable for tests)
├── migrations/            # SQL migrations
├── middleware/            # auth, validate, sanitize, rateLimiter, errorHandler, notFound, requestLogger
├── models/                # userModel, otpModel, smsLogModel, notificationModel
├── services/              # africastalking, smsService, smsTemplates, otpService, authService, userService, notificationService, packageService
├── controllers/           # authController, smsController, notificationController
├── routes/                # authRoutes, smsRoutes, notificationRoutes
├── utils/                 # logger, ApiError, asyncHandler, phone, validators, sanitizer, crypto
├── tests/
│   ├── helpers/           # fakeSupabase, fakeAfricastalking, server harness
│   ├── unit/              # phone, crypto, smsTemplates, validators
│   └── integration/       # authFlow, sms, notifications
├── postman/               # Postman collection
└── docs/                  # API, ENVIRONMENT, DEPLOYMENT, TESTING
```

## Security

- All secrets via environment variables
- JWT with 30d expiry, signed with `JWT_SECRET`
- OTPs hashed with HMAC-SHA256 (server secret)
- Helmet + CORS + input sanitization
- Per-phone 60s OTP resend limit, 5 verification attempts max
- IP-based rate limiting on all `/api` routes

## License

MIT