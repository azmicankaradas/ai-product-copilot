export { createSupabaseClient, createSupabaseAdmin } from "./client";
export type {
    Tenant,
    User,
    UserRole,
    Category,
    Product,
    ChatSession,
    Database,
} from "./types";

// Query helpers
export {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkInsertProducts,
} from "./queries/products";
export type {
    ListProductsParams,
    ListProductsResult,
    CreateProductInput,
    UpdateProductInput,
} from "./queries/products";

export { listCategories, getCategory } from "./queries/categories";
export { getCurrentUser, listTenantUsers } from "./queries/users";
