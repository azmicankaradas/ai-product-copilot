// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../types";

export interface ListProductsParams {
    tenantId?: string;
    categoryId?: string;
    brand?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    isActive?: boolean;
}

export interface ListProductsResult {
    data: Product[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function listProducts(
    supabase: SupabaseClient,
    params: ListProductsParams = {}
): Promise<ListProductsResult> {
    const { categoryId, brand, search, page = 1, pageSize = 25, isActive } = params;

    let query = supabase
        .from("products")
        .select("*", { count: "exact" });

    if (categoryId) {
        query = query.eq("category_id", categoryId);
    }

    if (brand) {
        query = query.eq("brand", brand);
    }

    if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        data: (data ?? []) as Product[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
    };
}

export async function getProduct(
    supabase: SupabaseClient,
    id: string
): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }

    return data as Product;
}

export interface CreateProductInput {
    tenant_id: string;
    category_id: string;
    brand?: string;
    sku: string;
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
    is_active?: boolean;
}

export async function createProduct(
    supabase: SupabaseClient,
    input: CreateProductInput
): Promise<Product> {
    const { data, error } = await supabase
        .from("products")
        .insert({
            tenant_id: input.tenant_id,
            category_id: input.category_id,
            brand: input.brand ?? null,
            sku: input.sku,
            name: input.name,
            description: input.description ?? null,
            metadata: input.metadata ?? {},
            is_active: input.is_active ?? true,
        })
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    is_active?: boolean;
    brand?: string;
    sku?: string;
    category_id?: string;
}

export async function updateProduct(
    supabase: SupabaseClient,
    id: string,
    input: UpdateProductInput
): Promise<Product> {
    const { data, error } = await supabase
        .from("products")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export async function deleteProduct(
    supabase: SupabaseClient,
    id: string
): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
}

export async function bulkInsertProducts(
    supabase: SupabaseClient,
    products: CreateProductInput[]
): Promise<{ inserted: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;

    // Insert in chunks of 100 to avoid payload limits
    const chunkSize = 100;
    for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize).map((p) => ({
            tenant_id: p.tenant_id,
            category_id: p.category_id,
            brand: p.brand ?? null,
            sku: p.sku,
            name: p.name,
            description: p.description ?? null,
            metadata: p.metadata ?? {},
            is_active: p.is_active ?? true,
        }));

        const { error, count } = await supabase
            .from("products")
            .insert(chunk)
            .select("id");

        if (error) {
            errors.push(`Chunk ${i / chunkSize + 1}: ${error.message}`);
        } else {
            inserted += count ?? chunk.length;
        }
    }

    return { inserted, errors };
}
