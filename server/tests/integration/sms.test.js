'use strict';

const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { baseUrl, close, db, sms, authenticate } = require('../helpers/server');

beforeEach(() => {
  db.reset();
  sms.sent.length = 0;
});

const jsonHeaders = { 'Content-Type': 'application/json' };

test('POST /api/sms/send requires authentication', async () => {
  const res = await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ to: '0788123456', message: 'Hello' }),
  });
  assert.strictEqual(res.status, 401);
});

test('POST /api/sms/send delivers via Africa\'s Talking and logs it', async () => {
  const { token } = await authenticate('0788111111');

  const res = await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: '0788123456', message: 'Hello from Kora' }),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.messageId, 'ATXid_abc123');

  assert.strictEqual(sms.sent.length, 1);
  assert.strictEqual(sms.sent[0].to, '+250788123456');
  assert.strictEqual(sms.sent[0].message, 'Hello from Kora');

  const logs = db._stores.sms_logs.rows;
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].status, 'sent');
  assert.strictEqual(logs[0].phone, '+250788123456');
  assert.strictEqual(logs[0].purpose, 'manual');
});

test('POST /api/sms/send rejects an empty message', async () => {
  const { token } = await authenticate('0788111112');
  const res = await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: '0788123456', message: '   ' }),
  });
  assert.strictEqual(res.status, 400);
});

test('POST /api/sms/send rejects an invalid phone', async () => {
  const { token } = await authenticate('0788111113');
  const res = await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: '12345', message: 'Hi' }),
  });
  assert.strictEqual(res.status, 400);
});

test('GET /api/sms/logs returns history', async () => {
  const { token } = await authenticate('0788111114');
  await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: '0788123456', message: 'Logged message' }),
  });

  const res = await fetch(`${baseUrl}/api/sms/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.logs));
  assert.ok(data.logs.length >= 1);
});

after(() => close());
