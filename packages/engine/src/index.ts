import type { Product } from "@ai-product-copilot/database";

/**
 * @ai-product-copilot/engine
 * Core matching / recommendation engine.
 *
 * This module will contain:
 * - Hybrid search (vector + deterministic filtering)
 * - LLM-powered query understanding
 * - Product scoring and ranking
 */

export interface MatchQuery {
    /** Natural-language search or structured query */
    query: string;
    /** Restrict to a specific category */
    categoryId?: string;
    /** Deterministic filters (e.g. protection_class = "S3") */
    filters?: Record<string, unknown>;
    /** Max results to return */
    limit?: number;
}

export interface MatchResult {
    product: Product;
    score: number;
    explanation?: string;
}

/**
 * Placeholder — will be implemented with pgvector similarity search
 * + deterministic filter overlay.
 */
export async function matchProducts(
    _query: MatchQuery
): Promise<MatchResult[]> {
    // TODO: Implement hybrid search pipeline
    return [];
}
