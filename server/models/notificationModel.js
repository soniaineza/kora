'use strict';
const { getSupabaseAdmin } = require('../database/supabase');

const TABLE = 'notifications';

async function create({ userId, phone, type, message, sent }) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({
      user_id: userId || null,
      phone: phone || null,
      type,
      message,
      sent: Boolean(sent),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function listByUser(userId, { limit = 50, offset = 0 } = {}) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

async function listByPhone(phone, { limit = 50, offset = 0 } = {}) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

module.exports = { create, listByUser, listByPhone };
