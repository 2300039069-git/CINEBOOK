import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jyptmaprxztaxjoapbjs.supabase.co';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize Supabase WebSocket if a genuine cryptographic anon key is provided in environment variables
const isValidAnonKey = Boolean(
  rawAnonKey &&
  rawAnonKey.length > 50 &&
  !rawAnonKey.endsWith('.public_anon_key') &&
  !rawAnonKey.includes('placeholder')
);

export const supabase = isValidAnonKey
  ? createClient(SUPABASE_URL, rawAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : null;

export default supabase;
