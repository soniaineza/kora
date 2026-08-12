'use strict';

/**
 * Data access for the `sms_logs` table.
 */

const { getSupabaseAdmin } = require('../database/supabase');

const TABLE = 'sms_logs';

async function create({ phone, message, status, providerResponse, purpose }) {
  const payload = {
    phone,
    message,
    status,
    purpose: purpose || null,
    provider_response: providerResponse ? JSON.stringify(providerResponse) : null,
  };
  const { data, error } = await getSupabaseAdmin().from(TABLE).insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

async function list({ phone, limit = 50, offset = 0 } = {}) {
  let query = getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (phone) {
    query = query.eq('phone', phone);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

module.exports = { create, list };
