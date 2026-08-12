'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const templates = require('../../services/smsTemplates');

test('otp template contains the code and expiry hint', () => {
  const msg = templates.otp('483921');
  assert.match(msg, /483921/);
  assert.match(msg, /expires in 5 minutes/);
});

test('welcome template includes name when provided', () => {
  assert.ok(templates.welcome('Alice').startsWith('Alice, Welcome to Kora!'));
  assert.ok(!templates.welcome().startsWith('Alice'));
});

test('paymentConfirmation template includes plan, amount and reference', () => {
  const msg = templates.paymentConfirmation({ plan: 'PREMIUM', amount: 3000, reference: 'fw_x' });
  assert.match(msg, /3000 RWF/);
  assert.match(msg, /PREMIUM/);
  assert.match(msg, /fw_x/);
});

test('lessonReminder and examReminder include scheduling details', () => {
  assert.match(templates.lessonReminder({ time: '15:00', venue: 'Kacyiru' }), /15:00/);
  assert.match(templates.lessonReminder({ time: '15:00', venue: 'Kacyiru' }), /Kacyiru/);
  assert.match(templates.examReminder({ time: '2026-08-05 09:00' }), /2026-08-05 09:00/);
});

test('result template reflects pass/fail verdict', () => {
  assert.match(templates.result({ score: 18, total: 20, passed: true }), /passed/);
  assert.match(templates.result({ score: 5, total: 20, passed: false }), /did not pass/);
});
