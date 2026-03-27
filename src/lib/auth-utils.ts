
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const ADMIN_EMAIL = "cjlacout.antigravity@gmail.com";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqfcfqflodpewdssicak.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K';

/**
 * Creates a dedicated supabase client for a single request
 * to ensure auth state doesn't leak or get lost.
 */
export function getRequestClient(token?: string) {
    if (!token) return supabase;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
}

export async function verifyAdmin(client: SupabaseClient, _token?: string) {
    const { data: { user }, error } = await client.auth.getUser();

    if (error) {
        console.error("Auth error:", error.message);
        throw new Error(`Error de sesión: ${error.message}`);
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        console.log(`[AUTH] Unauthorized attempt by: ${user?.email || 'None'}`);
        throw new Error(`Acceso no autorizado. (Usuario detectado: ${user?.email || 'Ninguno'})`);
    }
}
