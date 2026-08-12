'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const v = require('../../utils/validators');
const ApiError = require('../../utils/ApiError');

test('phone validator normalizes valid numbers', () => {
  assert.strictEqual(v.phone('+250788123456'), '+250788123456');
  assert.strictEqual(v.phone('0788123456'), '+250788123456');
});

test('phone validator rejects invalid input', () => {
  assert.throws(() => v.phone('123'), ApiError);
  assert.throws(() => v.phone(undefined), ApiError);
  assert.throws(() => v.phone(''), ApiError);
  assert.throws(() => v.phone('078812345'), ApiError);
});

test('otp validator accepts 6 digits only', () => {
  assert.strictEqual(v.otp('483921'), '483921');
  assert.throws(() => v.otp('12345'), ApiError);
  assert.throws(() => v.otp('abcdef'), ApiError);
  assert.throws(() => v.otp(undefined), ApiError);
});

test('stringField trims and enforces length', () => {
  assert.strictEqual(v.stringField('  hello  ', 'name'), 'hello');
  assert.throws(() => v.stringField('', 'name'), ApiError);
  assert.throws(() => v.stringField(undefined, 'name'), ApiError);
});

test('enumOf restricts values', () => {
  assert.strictEqual(v.enumOf('welcome', 'type', ['welcome', 'result']), 'welcome');
  assert.throws(() => v.enumOf('spam', 'type', ['welcome', 'result']), ApiError);
});
