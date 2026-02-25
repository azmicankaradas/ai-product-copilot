import type { SupabaseClient } from "@supabase/supabase-js";
import { embedText } from "./embedding";
import type { Product } from "@ai-product-copilot/database";

export interface SearchOptions {
    matchThreshold?: number;  // cosine similarity threshold (0-1), default 0.3
    matchCount?: number;      // max results, default 10
}

export interface SearchFilters {
    brand?: string;
    categoryId?: string;
    protectionClass?: string;
    electricalHazard?: boolean;
    antistatic?: boolean;
    toeCapMaterial?: string;
    nonMetallic?: boolean;
}

export interface SearchResult {
    product: Product;
    similarity: number;
}

/**
 * Semantic search: embed the query and find similar products using pgvector cosine similarity.
 */
export async function semanticSearch(
    supabase: SupabaseClient,
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { matchThreshold = 0.3, matchCount = 10 } = options;

    // Embed the search query
    const queryEmbedding = await embedText(query);

    // Call the pgvector match function
    const { data, error } = await supabase.rpc("match_products", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: matchThreshold,
        match_count: matchCount,
    });

    if (error) {
        throw new Error(`Semantic search failed: ${error.message}`);
    }

    return (data || []).map((row: Product & { similarity: number }) => ({
        product: row,
        similarity: row.similarity,
    }));
}

/**
 * Hybrid search: combines semantic similarity with deterministic SQL filters.
 * Filters are applied first to narrow the candidate set, then similarity ranking is applied.
 */
export async function hybridSearch(
    supabase: SupabaseClient,
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { matchThreshold = 0.3, matchCount = 10 } = options;

    // Embed the search query
    const queryEmbedding = await embedText(query);

    // Call the hybrid match function with filters
    const { data, error } = await supabase.rpc("match_products_hybrid", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_brand: filters.brand || null,
        filter_category_id: filters.categoryId || null,
        filter_protection_class: filters.protectionClass || null,
        filter_electrical_hazard: filters.electricalHazard ?? null,
        filter_antistatic: filters.antistatic ?? null,
        filter_toe_cap_material: filters.toeCapMaterial || null,
        filter_non_metallic: filters.nonMetallic ?? null,
    });

    if (error) {
        throw new Error(`Hybrid search failed: ${error.message}`);
    }

    return (data || []).map((row: Product & { similarity: number }) => ({
        product: row,
        similarity: row.similarity,
    }));
}

/**
 * Simple keyword + metadata search (no embeddings needed).
 * Useful as a fallback when embeddings aren't available.
 */
export async function filterSearch(
    supabase: SupabaseClient,
    filters: SearchFilters = {},
    search?: string,
    limit: number = 10
): Promise<Product[]> {
    let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

    if (filters.brand) {
        query = query.eq("brand", filters.brand);
    }
    if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
    }
    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (filters.protectionClass) {
        query = query.eq("metadata->>protection_class", filters.protectionClass);
    }
    if (filters.electricalHazard !== undefined) {
        query = query.eq("metadata->>electrical_hazard", String(filters.electricalHazard));
    }
    if (filters.toeCapMaterial) {
        query = query.eq("metadata->>toe_cap_material", filters.toeCapMaterial);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
        throw new Error(`Filter search failed: ${error.message}`);
    }

    return (data || []) as Product[];
}
