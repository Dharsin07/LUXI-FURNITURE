require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase Service Role Key...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasRealServiceRoleKey = !!serviceRoleKey && serviceRoleKey !== 'PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';
const supabaseKey = hasRealServiceRoleKey ? serviceRoleKey : process.env.SUPABASE_ANON_KEY;

console.log('Using key type:', hasRealServiceRoleKey ? 'SERVICE_ROLE' : 'ANON');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('Connection test failed:', error.message);
      console.error('This likely means the service role key is invalid or RLS is blocking access');
    } else {
      console.log('Connection successful! Service role key is working.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();
