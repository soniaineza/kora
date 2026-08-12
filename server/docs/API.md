# API Documentation

Base URL: `https://your-backend.example.com` (or `http://localhost:5001` in dev)

All endpoints return JSON. Errors follow `{ "ok": false, "error": "message", "details"?: any }`.

Authentication: Protected endpoints require `Authorization: Bearer <JWT>`.

---

## Auth (New Modular Endpoints)

### Send OTP

`POST /api/auth/send-otp`

Sends a 6-digit OTP via Africa's Talking SMS.

**Request**
```json
{
  "phone": "0788123456",
  "fullName": "Optional Name"
}
```

**Response (200)**
```json
{
  "ok": true,
  "message": "Verification code sent",
  "phone": "0788123456",
  "expiresAt": "2026-08-02T14:20:00.000Z",
  "devCode": "123456"  // only in non-production
}
```

**Errors**
- `400` — invalid phone format
- `429` — rate limited (one request per 60s per phone)

---

### Verify OTP

`POST /api/auth/verify-otp`

Verifies the code, creates the user if needed, returns a JWT.

**Request**
```json
{
  "phone": "0788123456",
  "code": "123456",
  "fullName": "Optional Name"
}
```

**Response (200)**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "phone": "0788123456",
  "user": {
    "id": "uuid",
    "phone": "0788123456",
    "full_name": "Optional Name",
    "created_at": "2026-08-02T14:15:00.000Z"
  }
}
```

**Errors**
- `400` — invalid phone or code format
- `401` — wrong code
- `429` — too many attempts (code locked after 5 failures)

---

## Legacy OTP (Web Frontend)

These endpoints are kept for the existing React web app. They behave identically to the new ones but use the `/api/otp/` prefix and return a slightly different shape (no `user` object on verify).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/otp/send` | Same as `/api/auth/send-otp` |
| `POST` | `/api/otp/verify` | Same as `/api/auth/verify-otp` but returns `{ ok, token, phone }` |

---

## SMS (Protected)

### Send Custom SMS

`POST /api/sms/send`

**Headers**: `Authorization: Bearer <token>`

**Request**
```json
{
  "to": "0788123456",
  "message": "Your custom message",
  "from": "OptionalSenderId"
}
```

**Response (200)**
```json
{
  "ok": true,
  "message": "SMS sent",
  "phone": "+250788123456",
  "messageId": "ATXid_abc123"
}
```

**Errors**
- `400` — invalid phone or empty message
- `401` — missing/invalid token
- `502` — AT delivery failed

---

### List SMS Logs

`GET /api/sms/logs?phone=0788123456&limit=50&offset=0`

**Headers**: `Authorization: Bearer <token>`

**Response (200)**
```json
{
  "ok": true,
  "logs": [
    {
      "id": "uuid",
      "phone": "+250788123456",
      "message": "Hello",
      "status": "sent",
      "purpose": "manual",
      "provider_response": { "SMSMessageData": { ... } },
      "created_at": "2026-08-02T14:15:00.000Z"
    }
  ]
}
```

---

## Notifications (Protected)

### Send Typed Notification

`POST /api/notifications/send`

**Headers**: `Authorization: Bearer <token>`

**Request** (varies by type)

| Type | Required Fields | Example |
|------|-----------------|---------|
| `welcome` | `phone`, optional `fullName` | `{ "type": "welcome", "phone": "0788123456", "fullName": "Alice" }` |
| `payment_confirmation` | `phone`, `plan`, `amount`, optional `reference` | `{ "type": "payment_confirmation", "phone": "0788123456", "plan": "PREMIUM", "amount": 3000, "reference": "fw_123" }` |
| `lesson_reminder` | `phone`, optional `time`, `venue` | `{ "type": "lesson_reminder", "phone": "0788123456", "time": "15:00", "venue": "Kacyiru" }` |
| `exam_reminder` | `phone`, optional `time` | `{ "type": "exam_reminder", "phone": "0788123456", "time": "2026-08-05 09:00" }` |
| `result` | `phone`, `score`, `total`, `passed` | `{ "type": "result", "phone": "0788123456", "score": 18, "total": 20, "passed": true }` |

**Response (200)**
```json
{
  "ok": true,
  "type": "welcome",
  "phone": "0788123456",
  "message": "Notification sent",
  "sms": { "messageId": "ATXid_abc123", "success": true }
}
```

**Errors**
- `400` — invalid type or missing required fields
- `401` — missing/invalid token
- `502` — SMS delivery failed

---

### List Notifications

`GET /api/notifications?limit=50&offset=0`

**Headers**: `Authorization: Bearer <token>`

**Response (200)**
```json
{
  "ok": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "welcome",
      "message": "Alice, Welcome to Kora! ...",
      "sent": true,
      "created_at": "2026-08-02T14:15:00.000Z"
    }
  ]
}
```

---

## Health

`GET /api/health`

**Response (200)**
```json
{
  "ok": true,
  "paymentMode": "demo"
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Global `/api/*` | 1000 req / 15 min per IP |
| `POST /api/auth/send-otp` | 10 req / 10 min per IP (+ 1/60s per phone) |
| `POST /api/auth/verify-otp` | 30 req / 10 min per IP |
| `POST /api/sms/send` | Global only |
| `POST /api/notifications/send` | Global only |

---

## Phone Number Format

Accepted formats (all normalized to `0788123456` internally, E.164 `+250788123456` for SMS):

- `0788123456` (local with leading 0)
- `788123456` (9 digits)
- `250788123456` (country code)
- `+250788123456` (E.164)

Only Rwandan mobile numbers (starting with `7` after country code) are accepted.