import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ai-product-copilot/database";

/**
 * Admin Supabase client using service_role key.
 * Bypasses RLS — use only in trusted server-side contexts (API routes).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        );
    }

    return createSupabaseClient<Database>(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
