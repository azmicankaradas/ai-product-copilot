import { createClient } from "@/lib/supabase/server";
import { listCategories, getCurrentUser } from "@ai-product-copilot/database";
import { ProductForm } from "../product-form";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
    const supabase = await createClient();
    const [categories, currentUser] = await Promise.all([
        listCategories(supabase),
        getCurrentUser(supabase),
    ]);

    if (!currentUser) {
        redirect("/login");
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Fill in the product details. Attribute fields will appear based on the selected category.
                </p>
            </div>
            <div className="max-w-3xl">
                <ProductForm
                    categories={categories}
                    tenantId={currentUser.tenant_id}
                    mode="create"
                />
            </div>
        </div>
    );
}
