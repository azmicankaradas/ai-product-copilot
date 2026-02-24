import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Create a Supabase client for browser / server-component usage.
 * Uses the anon key — RLS policies apply.
 */
export function createSupabaseClient(): SupabaseClient<Database> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    }

    return createClient<Database>(url, anonKey);
}

/**
 * Create a Supabase admin client (service-role key).
 * Bypasses RLS — use ONLY in trusted server contexts.
 */
export function createSupabaseAdmin(): SupabaseClient<Database> {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    return createClient<Database>(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
