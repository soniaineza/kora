'use strict';

/**
 * Data access for the `otp_codes` table.
 * Only ever receives hashed OTP values (see utils/crypto.js).
 */

const { getSupabaseAdmin } = require('../database/supabase');

const TABLE = 'otp_codes';

/** Remove expired codes. Call before every send/verify so stale rows never block users. */
async function deleteExpired() {
  const { error } = await getSupabaseAdmin()
    .from(TABLE)
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (error) throw error;
}

async function findLatest(phone) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function create({ phone, otpHash, expiresAt }) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({ phone, otp_hash: otpHash, expires_at: expiresAt, attempts: 0, verified: false })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function markVerified(id) {
  const { error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ verified: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function incrementAttempts(id, attempts) {
  const { error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ attempts, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function remove(id) {
  const { error } = await getSupabaseAdmin().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

module.exports = { deleteExpired, findLatest, create, markVerified, incrementAttempts, remove };
