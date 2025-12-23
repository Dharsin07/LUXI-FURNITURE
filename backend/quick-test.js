require('dotenv').config();
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasRealServiceRoleKey = !!serviceRoleKey && serviceRoleKey !== 'PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';
const supabaseKey = hasRealServiceRoleKey ? serviceRoleKey : process.env.SUPABASE_ANON_KEY;

console.log('Using key type:', hasRealServiceRoleKey ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

// Quick test
supabase.from('products').select('count').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('Supabase error:', error.message);
  } else {
    console.log('Supabase connection OK');
  }
});
