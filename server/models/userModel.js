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

async function create({ phone, fullName }) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({ phone, full_name: fullName || null })
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

module.exports = { findByPhone, findById, create, updateFullName };
