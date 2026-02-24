import { createClient } from "@/lib/supabase/server";
import { getProduct, listCategories, getCurrentUser } from "@ai-product-copilot/database";
import { ProductForm } from "../../product-form";
import { redirect, notFound } from "next/navigation";

export default async function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = await createClient();
    const [product, categories, currentUser] = await Promise.all([
        getProduct(supabase, params.id),
        listCategories(supabase),
        getCurrentUser(supabase),
    ]);

    if (!currentUser) redirect("/login");
    if (!product) notFound();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Update <span className="font-mono text-gray-300">{product.sku}</span> — {product.name}
                </p>
            </div>
            <div className="max-w-3xl">
                <ProductForm
                    categories={categories}
                    tenantId={currentUser.tenant_id}
                    mode="edit"
                    initialData={{
                        id: product.id,
                        sku: product.sku,
                        name: product.name,
                        description: product.description ?? "",
                        category_id: product.category_id,
                        metadata: product.metadata,
                        is_active: product.is_active,
                    }}
                />
            </div>
        </div>
    );
}
