'use strict';

/**
 * Data access for the `users` table.
 */

const { getSupabaseAdmin } = require('../database/supabase');

const TABLE = 'users';

async function findByPhone(phone) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function findById(id) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function findByEmail(email) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function create({ phone, fullName, passwordHash, email }) {
  // Only include password/email fields when provided so the OTP flow keeps
  // working even before the password columns are migrated.
  const payload = { phone, full_name: fullName || null };
  if (passwordHash) payload.password_hash = passwordHash;
  if (email) payload.email = email;
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function updatePassword(id, passwordHash) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function updateEmail(id, email) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ email, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function updateFullName(id, fullName) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

module.exports = { findByPhone, findByEmail, findById, create, updateFullName, updatePassword, updateEmail };
