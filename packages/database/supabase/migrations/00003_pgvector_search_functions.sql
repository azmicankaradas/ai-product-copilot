-- Migration: pgvector search functions for Gemini text-embedding-004 (768 dimensions)
-- ===============================================================

-- 1. Change embedding column to vector(3072) for Gemini text-embedding-004
DROP INDEX IF EXISTS idx_products_embedding;

ALTER TABLE public.products
    ALTER COLUMN embedding TYPE vector(3072)
    USING embedding::vector(3072);

-- 2. No vector index needed for small datasets (<1000 products)
-- pgvector indexes have a 2000-dimension limit; exact search is fast enough

-- 3. Basic semantic search function — cosine similarity
CREATE OR REPLACE FUNCTION match_products(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    tenant_id uuid,
    category_id uuid,
    brand text,
    sku text,
    name text,
    description text,
    metadata jsonb,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.tenant_id,
        p.category_id,
        p.brand,
        p.sku,
        p.name,
        p.description,
        p.metadata,
        p.is_active,
        p.created_at,
        p.updated_at,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM public.products p
    WHERE p.is_active = true
      AND p.embedding IS NOT NULL
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 4. Hybrid search function — semantic + deterministic filters
CREATE OR REPLACE FUNCTION match_products_hybrid(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10,
    filter_brand text DEFAULT NULL,
    filter_category_id uuid DEFAULT NULL,
    filter_protection_class text DEFAULT NULL,
    filter_electrical_hazard boolean DEFAULT NULL,
    filter_antistatic boolean DEFAULT NULL,
    filter_toe_cap_material text DEFAULT NULL,
    filter_non_metallic boolean DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    tenant_id uuid,
    category_id uuid,
    brand text,
    sku text,
    name text,
    description text,
    metadata jsonb,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.tenant_id,
        p.category_id,
        p.brand,
        p.sku,
        p.name,
        p.description,
        p.metadata,
        p.is_active,
        p.created_at,
        p.updated_at,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM public.products p
    WHERE p.is_active = true
      AND p.embedding IS NOT NULL
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
      AND (filter_brand IS NULL OR p.brand = filter_brand)
      AND (filter_category_id IS NULL OR p.category_id = filter_category_id)
      AND (filter_protection_class IS NULL OR p.metadata->>'protection_class' = filter_protection_class)
      AND (filter_electrical_hazard IS NULL OR (p.metadata->>'electrical_hazard')::boolean = filter_electrical_hazard)
      AND (filter_antistatic IS NULL OR (p.metadata->>'antistatic')::boolean = filter_antistatic)
      AND (filter_toe_cap_material IS NULL OR p.metadata->>'toe_cap_material' = filter_toe_cap_material)
      AND (filter_non_metallic IS NULL OR (p.metadata->>'non_metallic')::boolean = filter_non_metallic)
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
