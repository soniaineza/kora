'use strict';

const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { baseUrl, close, db, sms, authenticate } = require('../helpers/server');

beforeEach(() => {
  db.reset();
  sms.sent.length = 0;
});

const jsonHeaders = { 'Content-Type': 'application/json' };

async function sendNotification(token, body) {
  const res = await fetch(`${baseUrl}/api/notifications/send`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

test('POST /api/notifications/send requires authentication', async () => {
  const res = await fetch(`${baseUrl}/api/notifications/send`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ type: 'welcome', phone: '0788123456' }),
  });
  assert.strictEqual(res.status, 401);
});

test('welcome notification is delivered and persisted', async () => {
  const phone = '0788111120';
  const { token } = await authenticate(phone);

  const { status, body } = await sendNotification(token, {
    type: 'welcome',
    phone,
    fullName: 'Alice',
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(body.ok, true);

  assert.strictEqual(sms.sent.length, 1);
  assert.strictEqual(sms.sent[0].to, '+250788111120');

  const notifications = db._stores.notifications.rows;
  assert.strictEqual(notifications.length, 1);
  assert.strictEqual(notifications[0].type, 'welcome');
  assert.strictEqual(notifications[0].sent, true);
  assert.ok(notifications[0].user_id, 'user link should be resolved');
});

test('payment_confirmation requires plan and amount', async () => {
  const phone = '0788111121';
  const { token } = await authenticate(phone);

  const missing = await sendNotification(token, { type: 'payment_confirmation', phone });
  assert.strictEqual(missing.status, 400);

  const ok = await sendNotification(token, {
    type: 'payment_confirmation',
    phone,
    plan: 'PREMIUM',
    amount: 3000,
    reference: 'fw_test_1',
  });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.body.ok, true);
});

test('an unknown notification type is rejected', async () => {
  const phone = '0788111122';
  const { token } = await authenticate(phone);
  const { status } = await sendNotification(token, { type: 'nonsense', phone });
  assert.strictEqual(status, 400);
});

test('exam_reminder and result notifications work', async () => {
  const phone = '0788111124';
  const { token } = await authenticate(phone);

  const exam = await sendNotification(token, {
    type: 'exam_reminder',
    phone,
    time: '2026-08-05 09:00',
  });
  assert.strictEqual(exam.status, 200);

  const result = await sendNotification(token, {
    type: 'result',
    phone,
    score: 18,
    total: 20,
    passed: true,
  });
  assert.strictEqual(result.status, 200);

  const notifications = db._stores.notifications.rows;
  assert.strictEqual(notifications.length, 2);
  assert.strictEqual(sms.sent.length, 2);
});

test('result notification without score/total is rejected', async () => {
  const phone = '0788111125';
  const { token } = await authenticate(phone);
  const { status } = await sendNotification(token, { type: 'result', phone });
  assert.strictEqual(status, 400);
});

test('GET /api/notifications returns the caller\'s history', async () => {
  const phone = '0788111123';
  const { token } = await authenticate(phone);

  await sendNotification(token, { type: 'welcome', phone });

  const res = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.notifications));
  assert.ok(data.notifications.length >= 1);
  assert.strictEqual(data.notifications[0].type, 'welcome');
});

after(() => close());
