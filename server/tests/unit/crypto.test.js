'use strict';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon';
process.env.JWT_SECRET = 'test-secret';

const { test } = require('node:test');
const assert = require('node:assert');
const { hashOtp, otpMatches, generateOtp } = require('../../utils/crypto');

test('hashOtp is deterministic and value-sensitive', () => {
  assert.strictEqual(hashOtp('123456'), hashOtp('123456'));
  assert.notStrictEqual(hashOtp('123456'), hashOtp('654321'));
  assert.match(hashOtp('123456'), /^[0-9a-f]{64}$/);
});

test('otpMatches verifies only the matching code', () => {
  const hash = hashOtp('483921');
  assert.strictEqual(otpMatches('483921', hash), true);
  assert.strictEqual(otpMatches('000000', hash), false);
  assert.strictEqual(otpMatches('', null), false);
  assert.strictEqual(otpMatches(undefined, hash), false);
});

test('generateOtp returns a 6-digit numeric string', () => {
  for (let i = 0; i < 50; i += 1) {
    assert.match(generateOtp(), /^\d{6}$/);
  }
});
