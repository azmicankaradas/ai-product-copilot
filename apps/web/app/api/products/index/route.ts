import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { indexAllProducts } from "@ai-product-copilot/engine";

/**
 * POST /api/products/index
 * Trigger embedding generation for all products missing embeddings.
 */
export async function POST() {
    try {
        // Auth check with user client
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use admin client for database operations (bypasses RLS)
        const adminClient = createAdminClient();
        const result = await indexAllProducts(adminClient);

        return NextResponse.json({
            success: true,
            indexed: result.indexed,
            errors: result.errors,
            message: result.indexed > 0
                ? `${result.indexed} ürün başarıyla vektörlendi`
                : result.errors.length > 0
                    ? `Vektörleme başarısız: ${result.errors[0]}`
                    : "Tüm ürünler zaten vektörlenmiş",
        });
    } catch (error: unknown) {
        console.error("Indexing error:", error);
        const message = error instanceof Error ? error.message : "Indexing failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
