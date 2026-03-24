import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqfcfqflodpewdssicak.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K'

// Prevent Next.js Error Overlay from showing harmless Supabase token refresh failures
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.map(a => typeof a === 'object' && a?.message ? a.message : String(a)).join(' ');
    if (errorString.includes('AuthApiError') || errorString.includes('Refresh Token Not Found')) {
        return; // Ignore
    }
    originalConsoleError(...args);
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
