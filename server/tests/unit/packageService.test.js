'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const { PLAN_MAP, getPlan } = require('../../services/packageService');

test('plan keys do not include the discontinued BOOK package', () => {
  assert.ok(!('BOOK' in PLAN_MAP));
  assert.strictEqual(getPlan('BOOK'), null);
});

test('UNLIMITED is 7000 RWF for 45 days with a fixed exam allowance of 100', () => {
  const plan = getPlan('UNLIMITED');
  assert.ok(plan);
  assert.strictEqual(plan.amountRwf, 7000);
  assert.strictEqual(plan.days, 45);
  assert.strictEqual(plan.exams, 100);
  assert.strictEqual(plan.unlimited, false);
});

test('the 500 RWF starter is 10 exams for 3 days', () => {
  const plan = getPlan('STARTER');
  assert.strictEqual(plan.amountRwf, 500);
  assert.strictEqual(plan.exams, 10);
  assert.strictEqual(plan.days, 3);
});

test('PRO is 5000 RWF for 50 exams over 30 days', () => {
  const plan = getPlan('PRO');
  assert.strictEqual(plan.amountRwf, 5000);
  assert.strictEqual(plan.exams, 50);
  assert.strictEqual(plan.days, 30);
});

test('getPlan is case-insensitive and rejects unknown keys', () => {
  assert.ok(getPlan('unlimited'));
  assert.strictEqual(getPlan('BOOK'), null);
  assert.strictEqual(getPlan(''), null);
});
