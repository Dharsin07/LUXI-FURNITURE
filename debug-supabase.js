const { createClient } = require('@supabase/supabase-js');

// Test with the current credentials
const supabaseUrl = 'https://jsmskqsmsptrnjilvkrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzbXNrcXNtc3B0cm5qaWx2a3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTg1MzYsImV4cCI6MjA4MDgzNDUzNn0.SiZNO9-XP-hFM8uiwoqV4iaRNm5ewbhTlSWKG_c_BXM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseKey.length);
    
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Supabase connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Connection test failed:', err.message);
  }
}

testConnection();
