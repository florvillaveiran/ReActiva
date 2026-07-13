import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Supabase no esta configurado.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const fakeToken = `diagnostic-${Date.now()}`;

const contextResult = await supabase.rpc('get_invitation_context', {
  invitation_token: fakeToken,
});

const completionResult = await supabase.rpc('complete_user_onboarding', {
  invitation_token: fakeToken,
  user_email: 'diagnostic@example.invalid',
  user_full_name: 'Diagnostic User',
  onboarding_data: { diagnostic: true },
});

console.log(JSON.stringify({
  getInvitationContext: {
    code: contextResult.error?.code ?? null,
    message: contextResult.error?.message ?? null,
    callable: contextResult.error?.code !== 'PGRST202',
  },
  completeUserOnboarding: {
    code: completionResult.error?.code ?? null,
    message: completionResult.error?.message ?? null,
    callable: completionResult.error?.code !== 'PGRST202',
  },
}, null, 2));
