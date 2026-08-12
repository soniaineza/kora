# Environment Setup

## Required Variables

| Variable | Description | Required | Default (dev) |
|----------|-------------|----------|---------------|
| `SUPABASE_URL` | Supabase project URL | yes | — |
| `SUPABASE_ANON_KEY` | Supabase anon key | yes | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | yes (prod) | — |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | yes (prod) | `dev-secret` |

## Africa's Talking

| Variable | Description | Required | Notes |
|----------|-------------|----------|-------|
| `AFRICASTALKING_USERNAME` | AT username (use `sandbox` for sandbox mode) | no* | Sandbox auto-enabled when username is `sandbox` |
| `AFRICASTALKING_API_KEY` | AT API key | no* | |
| `AFRICASTALKING_SENDER_ID` | Registered alphanumeric sender ID or shortcode | no | Omitted in sandbox; required for some production routes |

\* If omitted, `/api/auth/send-otp` and `/api/otp/send` return the OTP in the response body (`devCode`) instead of sending SMS. This allows full local testing without an AT account.

## Optional / Tuning

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |
| `PORT` | HTTP port | `5001` |
| `OTP_TTL_MS` | OTP validity window | `300000` (5 min) |
| `OTP_MAX_ATTEMPTS` | Max verification attempts | `5` |
| `OTP_RESEND_INTERVAL_MS` | Min time between OTP requests | `60000` (1 min) |
| `OTP_SECRET` | HMAC key for hashing OTPs | `JWT_SECRET` or `otp-dev-secret` |
| `DEV_OTP_CODE` | Fixed code returned in non-production | `123456` |
| `CORS_ORIGINS` | Comma-separated additional allowed origins | — |
| `PAYMENT_MODE` | `demo` \| `production` | `demo` |
| `EXAM_DURATION_SECONDS` | Exam session TTL | `1200` (20 min) |

## Payments (Manual / Admin activation)

Payments are processed offline. A user places an order for a package, which is
recorded as `pending`. An admin then activates the order from the Admin panel
(`/admin/orders` → `POST /api/admin/payments/activate`) after receiving payment
outside the platform (MTN/Airtel Mobile Money, bank transfer, etc.).

No payment-provider keys are required for the manual flow. Only `PAYMENT_MODE`
(`demo` or `production`) is used for reporting.

## Paypack (Automatic Mobile Money)

Optional — enables automatic package activation via **MTN MoMo, Airtel Money and
Tigo Cash**. The user receives a payment prompt on their phone and the package
activates via webhook, no admin needed. When unset, the manual flow above is
used.

| Variable | Description | Default |
|----------|-------------|---------|
| `PAYPACK_CLIENT_ID` | Paypack agent client ID (from the Paypack dashboard) | — |
| `PAYPACK_CLIENT_SECRET` | Paypack agent client secret | — |
| `PAYPACK_BASE_URL` | Paypack API base URL | `https://payments.paypack.rw/api` |
| `PAYPACK_WEBHOOK_SECRET` | Secret used to verify `x-paypack-signature` webhooks | — |
| `PAYPACK_WEBHOOK_MODE` | `production` or `sandbox` webhook delivery | `production` |

Webhook URL to register in the Paypack dashboard:
`https://<your-backend>/webhooks/paypack`

The Paypack integration is enabled when both `PAYPACK_CLIENT_ID` and
`PAYPACK_CLIENT_SECRET` are set. Requests to `/api/payments/paypack/start`
return `502 Paypack payment request failed` when the credentials are invalid
(e.g. `agent not found`).

## Example `.env` (Development)

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

# Auth
JWT_SECRET=your-32-char-secret-here

# Africa's Talking — omit for local dev (uses devCode)
# AFRICASTALKING_USERNAME=sandbox
# AFRICASTALKING_API_KEY=your-sandbox-key
# AFRICASTALKING_SENDER_ID=Kora

# Optional tuning
NODE_ENV=development
PORT=5001
OTP_TTL_MS=300000
OTP_MAX_ATTEMPTS=5
OTP_RESEND_INTERVAL_MS=60000
```

## Example `.env` (Production)

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

JWT_SECRET=super-long-random-string-from-password-manager

AFRICASTALKING_USERNAME=your-at-username
AFRICASTALKING_API_KEY=your-at-api-key
AFRICASTALKING_SENDER_ID=Kora

NODE_ENV=production
PORT=5001

# Payments are manual/admin-activated (no provider keys needed)
PAYMENT_MODE=production
```

## Sandbox vs Production

- **Sandbox**: Set `AFRICASTALKING_USERNAME=sandbox`. The SDK routes requests to `https://api.sandbox.africastalking.com`. Use the sandbox API key from your AT dashboard. No sender ID needed.
- **Production**: Use your real AT username + API key. Register a sender ID (alphanumeric or shortcode) in the AT dashboard and set `AFRICASTALKING_SENDER_ID`.

## Validating Configuration

Run the server and check the startup log:

```
kora-server running on port 5001 (development) {
  "paymentMode": "demo",
  "smsConfigured": true,
  "atSandbox": false
}
```

- `smsConfigured: true` means both username and API key are present.
- `atSandbox: true` means sandbox mode is active.

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Missing required environment variable: SUPABASE_URL` | `.env` not loaded | Ensure `.env` is in `server/` or project root |
| `Africa's Talking not configured` in logs | AT vars missing | Add `AFRICASTALKING_USERNAME` + `AFRICASTALKING_API_KEY` or accept `devCode` in dev |
| `Invalid phone number` | Number format | Use Rwandan mobile format: `0788123456`, `788123456`, `+250788123456` |
| CORS errors on frontend | Origin not allowed | Add your frontend URL to `CORS_ORIGINS` |

## Security Checklist

- [ ] `JWT_SECRET` is a long random string (32+ chars)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never committed
- [ ] `AFRICASTALKING_API_KEY` is never committed
- [ ] `NODE_ENV=production` in production
- [ ] HTTPS enforced by hosting platform
- [ ] Rate limits appropriate for your traffic