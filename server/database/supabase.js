'use strict';

/**
 * Supabase client factory.
 *
 * Models call getSupabaseAdmin() lazily so the client can be swapped out in
 * tests (see setSupabaseAdminForTests). This is the single seam between the
 * application and the database.
 */

const { createClient } = require('@supabase/supabase-js');
const { config } = require('../config/env');

let adminClient = null;
let anonClient = null;

function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey
    );
  }
  return adminClient;
}

function getSupabaseAnon() {
  if (!anonClient) {
    anonClient = createClient(config.supabase.url, config.supabase.anonKey);
  }
  return anonClient;
}

/** Test-only hook: replace the admin client with an in-memory fake. */
function setSupabaseAdminForTests(client) {
  adminClient = client;
}

/** Test-only hook: restore the real client. */
function resetClientsForTests() {
  adminClient = null;
  anonClient = null;
}

module.exports = {
  getSupabaseAdmin,
  getSupabaseAnon,
  setSupabaseAdminForTests,
  resetClientsForTests,
};
