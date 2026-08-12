'use strict';

/**
 * Test harness: boots the real Express app on an ephemeral port with an
 * in-memory Supabase fake and a fake Africa's Talking SMS client injected.
 */

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../../app');
const { setSupabaseAdminForTests } = require('../../database/supabase');
const { setSmsClientForTests } = require('../../services/africastalking');
const { createFakeSupabase } = require('./fakeSupabase');
const { createFakeSms } = require('./fakeAfricastalking');

const db = createFakeSupabase();
const sms = createFakeSms();
setSupabaseAdminForTests(db);
setSmsClientForTests(sms);

const server = app.listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

async function close() {
  await new Promise((resolve) => server.close(resolve));
}

/**
 * Authenticate a phone via the real OTP flow and return { token, phone }.
 * In test mode the API returns the dev code (`123456`) instead of sending SMS.
 */
async function authenticate(phone = '0788123456', fullName = 'Test User') {
  const sendRes = await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const sendData = await sendRes.json();
  if (!sendData.ok) throw new Error(`send-otp failed: ${JSON.stringify(sendData)}`);

  const verifyRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code: sendData.devCode, fullName }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.ok) throw new Error(`verify-otp failed: ${JSON.stringify(verifyData)}`);
  return { token: verifyData.token, phone: verifyData.phone, user: verifyData.user };
}

module.exports = { baseUrl, close, db, sms, authenticate };
