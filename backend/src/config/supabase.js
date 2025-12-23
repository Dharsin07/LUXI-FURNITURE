const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasRealServiceRoleKey = !!serviceRoleKey && serviceRoleKey !== 'PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';
const supabaseKey = hasRealServiceRoleKey ? serviceRoleKey : process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check SUPABASE_URL and SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
