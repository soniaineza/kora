'use strict';

const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { baseUrl, close, db } = require('../helpers/server');

beforeEach(() => db.reset());

const jsonHeaders = { 'Content-Type': 'application/json' };

async function sendOtp(phone) {
  const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ phone }),
  });
  return { status: res.status, body: await res.json() };
}

async function verifyOtp(phone, code) {
  const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ phone, code }),
  });
  return { status: res.status, body: await res.json() };
}

test('POST /api/auth/send-otp returns a dev code in non-production', async () => {
  const { status, body } = await sendOtp('0788123456');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.ok, true);
  assert.match(body.devCode, /^\d{6}$/);
  assert.ok(body.expiresAt);
  // row persisted (hashed, never plain text)
  const rows = db._stores.otp_codes.rows;
  assert.strictEqual(rows.length, 1);
  assert.notStrictEqual(rows[0].otp_hash, body.devCode);
  assert.match(rows[0].otp_hash, /^[0-9a-f]{64}$/);
});

test('send-otp is rate limited to one request per 60 seconds', async () => {
  await sendOtp('0788000099');
  const { status, body } = await sendOtp('0788000099');
  assert.strictEqual(status, 429);
  assert.match(body.error, /wait/);
});

test('send-otp validates the phone number', async () => {
  const { status } = await sendOtp('123');
  assert.strictEqual(status, 400);
});

test('full happy path: verify issues a token and provisions the user', async () => {
  const phone = '0788000100';
  const sent = await sendOtp(phone);
  const { status, body } = await verifyOtp(phone, sent.body.devCode);

  assert.strictEqual(status, 200);
  assert.ok(body.token, 'expected a JWT');
  assert.strictEqual(body.phone, phone);
  assert.ok(body.user);
  assert.strictEqual(body.user.phone, phone);

  const users = db._stores.users.rows;
  assert.strictEqual(users.length, 1);
  assert.strictEqual(users[0].phone, phone);

  const codes = db._stores.otp_codes.rows;
  assert.strictEqual(codes[0].verified, true);
});

test('a verified code cannot be reused', async () => {
  const phone = '0788000101';
  const sent = await sendOtp(phone);
  await verifyOtp(phone, sent.body.devCode);
  const { status } = await verifyOtp(phone, sent.body.devCode);
  assert.strictEqual(status, 400);
});

test('wrong codes increment attempts and lock the code after 5', async () => {
  const phone = '0788000102';
  const sent = await sendOtp(phone);

  let lastStatus = null;
  for (let i = 0; i < 5; i += 1) {
    const result = await verifyOtp(phone, '000000');
    lastStatus = result.status;
  }
  assert.strictEqual(lastStatus, 429, 'the 5th failed attempt must lock the code');
  assert.strictEqual(db._stores.otp_codes.rows.length, 0, 'locked code is deleted');
});

test('expired codes are rejected and cleaned up', async () => {
  const phone = '0788000103';
  const sent = await sendOtp(phone);

  const rows = db._stores.otp_codes.rows;
  rows[rows.length - 1].expires_at = new Date(Date.now() - 1000).toISOString();

  const { status } = await verifyOtp(phone, sent.body.devCode);
  assert.strictEqual(status, 400);
  assert.strictEqual(db._stores.otp_codes.rows.length, 0, 'expired code is deleted');
});

test('verify-otp validates the code format', async () => {
  const phone = '0788000104';
  await sendOtp(phone);
  const { status } = await verifyOtp(phone, '12');
  assert.strictEqual(status, 400);
});

test('the issued token works on a protected endpoint', async () => {
  const phone = '0788000105';
  const sent = await sendOtp(phone);
  const { body } = await verifyOtp(phone, sent.body.devCode);

  const res = await fetch(`${baseUrl}/api/sms/logs`, {
    headers: { Authorization: `Bearer ${body.token}` },
  });
  assert.strictEqual(res.status, 200);
});

test('protected endpoint rejects a missing/invalid token', async () => {
  const missing = await fetch(`${baseUrl}/api/sms/logs`);
  assert.strictEqual(missing.status, 401);

  const invalid = await fetch(`${baseUrl}/api/sms/logs`, {
    headers: { Authorization: 'Bearer not.a.jwt' },
  });
  assert.strictEqual(invalid.status, 401);
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/nope`);
  assert.strictEqual(res.status, 404);
});

after(() => close());
