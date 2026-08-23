import 'dotenv/config';

const env = {
  port: process.env.PORT || 3000,

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};

export default env;