'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const { normalizePhone, isValidRwandaPhone, toInternationalPhone, toLocalKey } = require('../../utils/phone');

test('normalizePhone strips all formatting', () => {
  assert.strictEqual(normalizePhone('+250 788 123 456'), '250788123456');
  assert.strictEqual(normalizePhone('0788-123-456'), '0788123456');
  assert.strictEqual(normalizePhone(788123456), '788123456');
  assert.strictEqual(normalizePhone('abc0788x'), '0788');
});

test('isValidRwandaPhone accepts accepted formats', () => {
  assert.ok(isValidRwandaPhone('0788123456'));
  assert.ok(isValidRwandaPhone('788123456'));
  assert.ok(isValidRwandaPhone('250788123456'));
  assert.ok(isValidRwandaPhone('+250788123456'));
});

test('isValidRwandaPhone rejects invalid numbers', () => {
  assert.strictEqual(isValidRwandaPhone('12345'), false);
  assert.strictEqual(isValidRwandaPhone('0612345678'), false);
  assert.strictEqual(isValidRwandaPhone('78812345'), false);
  assert.strictEqual(isValidRwandaPhone('abcdef'), false);
  assert.strictEqual(isValidRwandaPhone(''), false);
});

test('toInternationalPhone converts to E.164', () => {
  assert.strictEqual(toInternationalPhone('0788123456'), '+250788123456');
  assert.strictEqual(toInternationalPhone('788123456'), '+250788123456');
  assert.strictEqual(toInternationalPhone('250788123456'), '+250788123456');
  assert.strictEqual(toInternationalPhone('+250788123456'), '+250788123456');
});

test('toLocalKey produces the canonical 10-digit key from any format', () => {
  assert.strictEqual(toLocalKey('0788123456'), '0788123456');
  assert.strictEqual(toLocalKey('788123456'), '0788123456');
  assert.strictEqual(toLocalKey('250788123456'), '0788123456');
  assert.strictEqual(toLocalKey('+250788123456'), '0788123456');
});
