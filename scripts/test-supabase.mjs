import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('companies').select('id').limit(1);
    if (error) {
      console.error('Supabase query error:', error);
      process.exit(1);
    }
    console.log('Supabase reachable — sample rows:', Array.isArray(data) ? data.length : 0);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

void test();
