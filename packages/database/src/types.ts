/* ------------------------------------------------------------------ */
/*  TypeScript types matching the Supabase SQL schema                   */
/*  Regenerate with: npx supabase gen types typescript --local          */
/* ------------------------------------------------------------------ */

/** Enum: user_role */
export type UserRole = "admin" | "sales_rep" | "guest";

/** Table: tenants */
export interface Tenant {
    id: string;
    name: string;
    domain: string | null;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

/** Table: users */
export interface User {
    id: string;
    tenant_id: string;
    role: UserRole;
    email: string;
    full_name: string | null;
    chat_quota: number;
    created_at: string;
    updated_at: string;
}

/** Table: categories */
export interface Category {
    id: string;
    name: string;
    parent_id: string | null;
    attributes_schema: Record<string, unknown>;
    created_at: string;
}

/** Table: products */
export interface Product {
    id: string;
    tenant_id: string;
    category_id: string;
    brand: string | null;
    sku: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown>;
    embedding: number[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/** Table: chat_sessions */
export interface ChatSession {
    id: string;
    tenant_id: string;
    user_id: string;
    message_count: number;
    created_at: string;
    updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Database helper type (used by SupabaseClient<Database>)             */
/* ------------------------------------------------------------------ */
export interface Database {
    public: {
        Tables: {
            tenants: {
                Row: Tenant;
                Insert: {
                    id?: string;
                    name: string;
                    domain?: string | null;
                    settings?: Record<string, unknown>;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    domain?: string | null;
                    settings?: Record<string, unknown>;
                    updated_at?: string;
                };
                Relationships: [];
            };
            users: {
                Row: User;
                Insert: {
                    id?: string;
                    tenant_id: string;
                    role?: UserRole;
                    email: string;
                    full_name?: string | null;
                    chat_quota?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tenant_id?: string;
                    role?: UserRole;
                    email?: string;
                    full_name?: string | null;
                    chat_quota?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "users_tenant_id_fkey";
                        columns: ["tenant_id"];
                        referencedRelation: "tenants";
                        referencedColumns: ["id"];
                    }
                ];
            };
            categories: {
                Row: Category;
                Insert: {
                    id?: string;
                    name: string;
                    parent_id?: string | null;
                    attributes_schema?: Record<string, unknown>;
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    parent_id?: string | null;
                    attributes_schema?: Record<string, unknown>;
                };
                Relationships: [];
            };
            products: {
                Row: Product;
                Insert: {
                    id?: string;
                    tenant_id: string;
                    category_id: string;
                    brand?: string | null;
                    sku: string;
                    name: string;
                    description?: string | null;
                    metadata?: Record<string, unknown>;
                    embedding?: number[] | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tenant_id?: string;
                    category_id?: string;
                    brand?: string | null;
                    sku?: string;
                    name?: string;
                    description?: string | null;
                    metadata?: Record<string, unknown>;
                    embedding?: number[] | null;
                    is_active?: boolean;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "products_tenant_id_fkey";
                        columns: ["tenant_id"];
                        referencedRelation: "tenants";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "products_category_id_fkey";
                        columns: ["category_id"];
                        referencedRelation: "categories";
                        referencedColumns: ["id"];
                    }
                ];
            };
            chat_sessions: {
                Row: ChatSession;
                Insert: {
                    id?: string;
                    tenant_id: string;
                    user_id: string;
                    message_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tenant_id?: string;
                    user_id?: string;
                    message_count?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "chat_sessions_tenant_id_fkey";
                        columns: ["tenant_id"];
                        referencedRelation: "tenants";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "chat_sessions_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: Record<string, never>;
        Functions: {
            get_user_tenant_id: {
                Args: Record<string, never>;
                Returns: string;
            };
        };
        Enums: {
            user_role: UserRole;
        };
        CompositeTypes: Record<string, never>;
    };
}
