const { createClient } = require('@supabase/supabase-js');
 
// Admin client — bypasses RLS, for server-side admin actions only
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
 
// Regular client — respects RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
 
module.exports = { supabase, supabaseAdmin };