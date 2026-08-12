# Testing Guide

## Running Tests

```bash
cd server
npm test
```

This runs all unit and integration tests using Node's built-in test runner (`node --test`).

## Test Structure

```
tests/
├── helpers/
│   ├── fakeSupabase.js       # In-memory Supabase PostgREST fake
│   ├── fakeAfricastalking.js # Mock AT SMS client
│   └── server.js             # Test harness: boots real Express app on ephemeral port
├── unit/
│   ├── phone.test.js         # Phone normalization/validation
│   ├── crypto.test.js        # OTP hashing/verification
│   ├── smsTemplates.test.js  # Message template contents
│   └── validators.test.js    # Request validators
└── integration/
    ├── authFlow.test.js      # OTP send/verify, rate limits, attempts, expiry
    ├── sms.test.js           # Custom SMS send + logs
    └── notifications.test.js # Typed notifications + history
```

## How It Works

- **No external dependencies**: Each test file runs in its own process with `NODE_ENV=test`.
- **Fake Supabase**: The `fakeSupabase` helper implements the subset of the PostgREST query builder used by the models (`select/insert/update/delete`, filters, pagination). It stores rows in memory.
- **Fake Africa's Talking**: `fakeAfricastalking` mimics `SMS.send()` returning a successful `SMSMessageData` response with a fake `messageId`.
- **Real Express app**: The test harness (`server.js`) requires the actual `app.js`, swaps the Supabase and AT clients for the fakes, and starts the server on a random port. Tests hit it via `fetch()`.

## Adding a Unit Test

Create a file under `tests/unit/` ending in `.test.js`:

```js
'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const { myFunction } = require('../../utils/myModule');

test('myFunction does X', () => {
  assert.strictEqual(myFunction('input'), 'expected');
});
```

## Adding an Integration Test

Create a file under `tests/integration/` ending in `.test.js`. Use the server helper:

```js
'use strict';

const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { baseUrl, close, db, authenticate } = require('../helpers/server');

beforeEach(() => db.reset());

test('my feature works', async () => {
  const { token } = await authenticate('0788123456');
  const res = await fetch(`${baseUrl}/api/my-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ foo: 'bar' }),
  });
  assert.strictEqual(res.status, 200);
});

after(() => close());
```

## Test Helpers Reference

### `server.js` exports

| Export | Description |
|--------|-------------|
| `baseUrl` | `http://127.0.0.1:<random-port>` |
| `close()` | Stops the test server (call in `after`) |
| `db` | Fake Supabase instance (`db._stores.<table>.rows` for inspection) |
| `sms` | Fake AT client (`sms.sent` array of sent messages) |
| `authenticate(phone, fullName?)` | Runs send-otp + verify-otp, returns `{ token, phone, user }` |

### Fake Supabase (`db`)

| Property | Description |
|----------|-------------|
| `db._stores.<table>.rows` | Array of all rows in a table (for assertions) |
| `db.reset()` | Clears all tables |

### Fake AT (`sms`)

| Property | Description |
|----------|-------------|
| `sms.sent` | Array of `{ to, message, from }` for each `send()` call |
| `sms.fail = true` | Makes the next `send()` throw (for error-path tests) |

## Common Patterns

### Assert a Notification Was Persisted

```js
const notifs = db._stores.notifications.rows;
const mine = notifs.find(n => n.phone === '+250788123456');
assert.ok(mine);
assert.strictEqual(mine.type, 'welcome');
assert.strictEqual(mine.sent, true);
```

### Assert SMS Was Sent

```js
assert.strictEqual(sms.sent.length, 1);
assert.strictEqual(sms.sent[0].to, '+250788123456');
assert.match(sms.sent[0].message, /Welcome to Kora/);
```

### Simulate an Expired OTP

```js
const rows = db._stores.otp_codes.rows;
rows[0].expires_at = new Date(Date.now() - 1000).toISOString();
```

### Test Africa's Talking Failure

```js
sms.fail = true;
const res = await fetch(...); // expect 502
sms.fail = false; // reset
```

## Continuous Integration

Example GitHub Actions workflow (`.github/workflows/test.yml`):

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: cd server && npm ci
      - run: cd server && npm test
```

## Debugging Tests

- Run a single file: `node --test tests/integration/authFlow.test.js`
- Enable debug logs: `DEBUG=1 npm test`
- Inspect fake DB: add `console.log(db._stores.otp_codes.rows)` in a test
- The test runner prints structured logs (the same logger used by the app)

## Coverage (Optional)

Node 24 has experimental coverage via `node --experimental-test-coverage --test ...`. For now, the test suite focuses on critical paths (OTP, SMS, notifications) with >90% logical coverage of the new modules.