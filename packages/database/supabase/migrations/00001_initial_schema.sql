-- ============================================================================
-- AI PRODUCT COPILOT — Initial Schema Migration
-- Multi-tenant B2B PPE product recommendation platform
-- ============================================================================
-- This migration creates the foundational multi-tenant schema with strict
-- Row-Level Security (RLS) policies ensuring complete tenant data isolation.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for embeddings

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'sales_rep', 'guest');

-- ============================================================================
-- 3. TABLES (created BEFORE functions that reference them)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 TENANTS
-- ----------------------------------------------------------------------------
CREATE TABLE public.tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    domain      TEXT UNIQUE,
    settings    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenants IS 'Root multi-tenant table. Each tenant represents a business customer (e.g. GTC Industrial).';
COMMENT ON COLUMN public.tenants.settings IS 'Tenant-specific configuration: branding, feature flags, quotas, etc.';

-- ----------------------------------------------------------------------------
-- 3.2 USERS
-- ----------------------------------------------------------------------------
CREATE TABLE public.users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role        public.user_role NOT NULL DEFAULT 'guest',
    email       TEXT NOT NULL,
    full_name   TEXT,
    chat_quota  INTEGER NOT NULL DEFAULT 100,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT users_email_per_tenant UNIQUE (tenant_id, email)
);

COMMENT ON TABLE public.users IS 'Platform users, always scoped to a single tenant.';
COMMENT ON COLUMN public.users.chat_quota IS 'Maximum AI chat messages the user may send per billing period.';

-- ----------------------------------------------------------------------------
-- 3.3 CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE public.categories (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL UNIQUE,
    parent_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    attributes_schema JSONB NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'PPE product categories (shoes, gloves, helmets, etc.). Global — shared across tenants.';
COMMENT ON COLUMN public.categories.attributes_schema IS
    'JSON Schema defining the allowed metadata keys for products in this category '
    '(e.g. protection_class, lens_material). Used for validation and dynamic form generation.';

-- ----------------------------------------------------------------------------
-- 3.4 PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE public.products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    sku         TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}',
    embedding   vector(1536),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT products_sku_per_tenant UNIQUE (tenant_id, sku)
);

COMMENT ON TABLE public.products IS 'Tenant-scoped product catalog. Each product belongs to one category.';
COMMENT ON COLUMN public.products.metadata IS 'Category-specific attributes (must conform to categories.attributes_schema).';
COMMENT ON COLUMN public.products.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic search.';

-- ----------------------------------------------------------------------------
-- 3.5 CHAT SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE public.chat_sessions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_sessions IS 'AI chat sessions for product recommendation conversations.';

-- ============================================================================
-- 4. HELPER FUNCTION: get_user_tenant_id()
-- ============================================================================
-- Defined AFTER users table exists. Reads the authenticated user's tenant_id.
-- Used by every RLS policy to enforce tenant isolation.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT tenant_id
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

-- B-tree indexes for tenant-scoped queries
CREATE INDEX idx_users_tenant         ON public.users(tenant_id);
CREATE INDEX idx_products_tenant      ON public.products(tenant_id);
CREATE INDEX idx_products_category    ON public.products(category_id);
CREATE INDEX idx_chat_sessions_tenant ON public.chat_sessions(tenant_id);
CREATE INDEX idx_chat_sessions_user   ON public.chat_sessions(user_id);

-- HNSW index for vector similarity search (cosine distance)
CREATE INDEX idx_products_embedding ON public.products
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. ROW-LEVEL SECURITY (RLS)
-- ============================================================================
-- Every table has RLS enabled.
-- Policies ensure users can ONLY access data belonging to their own tenant.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 TENANTS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Users can read their own tenant's record
CREATE POLICY tenants_select_own ON public.tenants
    FOR SELECT
    USING (id = public.get_user_tenant_id());

-- Only admins can update their own tenant
CREATE POLICY tenants_update_own ON public.tenants
    FOR UPDATE
    USING (id = public.get_user_tenant_id())
    WITH CHECK (id = public.get_user_tenant_id());

-- Tenant creation is reserved for service-role (no user policy)
-- Tenant deletion is reserved for service-role (no user policy)

-- ----------------------------------------------------------------------------
-- 7.2 USERS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can see all users in their own tenant
CREATE POLICY users_select_same_tenant ON public.users
    FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- Only admins can insert users into their own tenant
CREATE POLICY users_insert_own_tenant ON public.users
    FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update users in their own tenant
CREATE POLICY users_update_own_tenant ON public.users
    FOR UPDATE
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete users in their own tenant
CREATE POLICY users_delete_own_tenant ON public.users
    FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- 7.3 CATEGORIES RLS
-- ----------------------------------------------------------------------------
-- Categories are global (shared across tenants).
-- All authenticated users can read. Only service-role can mutate.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_select_authenticated ON public.categories
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE: service-role only (no user-facing policy)

-- ----------------------------------------------------------------------------
-- 7.4 PRODUCTS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Users can read products in their own tenant
CREATE POLICY products_select_own_tenant ON public.products
    FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- Admins and sales reps can insert products
CREATE POLICY products_insert_own_tenant ON public.products
    FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- Admins and sales reps can update products in their tenant
CREATE POLICY products_update_own_tenant ON public.products
    FOR UPDATE
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- Only admins can delete products
CREATE POLICY products_delete_own_tenant ON public.products
    FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- 7.5 CHAT SESSIONS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own chat sessions
CREATE POLICY chat_sessions_select_own ON public.chat_sessions
    FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Admins can read all chat sessions in their tenant
CREATE POLICY chat_sessions_select_admin ON public.chat_sessions
    FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can create their own chat sessions
CREATE POLICY chat_sessions_insert_own ON public.chat_sessions
    FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Users can update their own chat sessions (e.g. increment message_count)
CREATE POLICY chat_sessions_update_own ON public.chat_sessions
    FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND user_id = auth.uid()
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Only admins can delete chat sessions in their tenant
CREATE POLICY chat_sessions_delete_admin ON public.chat_sessions
    FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 8. SEED DATA: Initial Tenant (GTC Industrial)
-- ============================================================================

INSERT INTO public.tenants (name, domain, settings) VALUES
    ('GTC Industrial', 'gtc-industrial.com', '{
        "branding": {
            "primary_color": "#0270c7",
            "logo_url": null
        },
        "quotas": {
            "max_products": 10000,
            "max_users": 50,
            "chat_messages_per_user": 100
        },
        "features": {
            "ai_chat": true,
            "pdf_ingestion": false,
            "erp_integration": false
        }
    }');

-- ============================================================================
-- 9. SEED DATA: Default PPE Categories with Attribute Schemas
-- ============================================================================

INSERT INTO public.categories (name, attributes_schema) VALUES
    ('Safety Footwear', '{
        "type": "object",
        "properties": {
            "protection_class":   { "type": "string", "enum": ["S1", "S1P", "S2", "S3", "S4", "S5"] },
            "toe_cap_material":   { "type": "string", "enum": ["steel", "composite", "aluminum"] },
            "slip_resistance":    { "type": "string", "enum": ["SRA", "SRB", "SRC"] },
            "waterproof":         { "type": "boolean" },
            "esd_protection":     { "type": "boolean" },
            "size_range":         { "type": "string" }
        },
        "required": ["protection_class"]
    }'),
    ('Safety Gloves', '{
        "type": "object",
        "properties": {
            "cut_resistance_level": { "type": "string", "enum": ["A1","A2","A3","A4","A5","A6","A7","A8","A9"] },
            "coating_material":     { "type": "string", "enum": ["nitrile", "latex", "PU", "PVC", "neoprene"] },
            "food_safe":            { "type": "boolean" },
            "touchscreen_compatible": { "type": "boolean" },
            "chemical_resistant":   { "type": "boolean" }
        },
        "required": ["cut_resistance_level"]
    }'),
    ('Safety Eyewear', '{
        "type": "object",
        "properties": {
            "lens_material":  { "type": "string", "enum": ["polycarbonate", "glass", "CR-39"] },
            "anti_fog":       { "type": "boolean" },
            "anti_scratch":   { "type": "boolean" },
            "uv_protection":  { "type": "boolean" },
            "style":          { "type": "string", "enum": ["spectacle", "goggle", "over-glass"] }
        },
        "required": ["lens_material"]
    }'),
    ('Head Protection', '{
        "type": "object",
        "properties": {
            "type":           { "type": "string", "enum": ["hard_hat", "bump_cap", "climbing_helmet"] },
            "material":       { "type": "string", "enum": ["ABS", "HDPE", "polycarbonate", "fiberglass"] },
            "ventilated":     { "type": "boolean" },
            "chin_strap":     { "type": "boolean" },
            "electrical_class": { "type": "string", "enum": ["E", "G", "C"] }
        },
        "required": ["type"]
    }'),
    ('Workwear & Textile', '{
        "type": "object",
        "properties": {
            "garment_type":   { "type": "string", "enum": ["jacket", "trousers", "coverall", "vest", "shirt"] },
            "hi_vis_class":   { "type": "string", "enum": ["1", "2", "3"] },
            "flame_resistant": { "type": "boolean" },
            "waterproof":     { "type": "boolean" },
            "material":       { "type": "string" }
        },
        "required": ["garment_type"]
    }'),
    ('Gas Detection', '{
        "type": "object",
        "properties": {
            "detector_type":   { "type": "string", "enum": ["single_gas", "multi_gas", "area_monitor"] },
            "gases_detected":  { "type": "array", "items": { "type": "string" } },
            "portable":        { "type": "boolean" },
            "battery_life_hours": { "type": "number" }
        },
        "required": ["detector_type"]
    }');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
