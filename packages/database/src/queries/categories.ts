import { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "../types";

export async function listCategories(
    supabase: SupabaseClient
): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Category[];
}

export async function getCategory(
    supabase: SupabaseClient,
    id: string
): Promise<Category | null> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data as Category;
}
