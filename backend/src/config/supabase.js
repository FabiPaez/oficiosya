import { createClient } from '@supabase/supabase-js';
import env from './env.js';

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
);

export const supabaseAdmin = env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
