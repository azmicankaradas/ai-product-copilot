import { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "../types";

export async function getCurrentUser(
    supabase: SupabaseClient
): Promise<User | null> {
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data as User;
}

export async function listTenantUsers(
    supabase: SupabaseClient
): Promise<User[]> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as User[];
}
