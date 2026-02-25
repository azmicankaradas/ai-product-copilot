import type { SupabaseClient } from "@supabase/supabase-js";
import { embedProduct } from "./embedding";

/**
 * Generate and store an embedding for a single product.
 */
export async function indexProduct(
    supabase: SupabaseClient,
    productId: string
): Promise<void> {
    // Fetch the product
    const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("id, name, brand, description, metadata")
        .eq("id", productId)
        .single();

    if (fetchError || !product) {
        throw new Error(`Product not found: ${productId} — ${fetchError?.message}`);
    }

    // Generate embedding
    const embedding = await embedProduct(product);

    // Store embedding — pgvector expects a string like "[0.1, 0.2, ...]"
    const embeddingStr = `[${embedding.join(",")}]`;

    const { error: updateError } = await supabase
        .from("products")
        .update({ embedding: embeddingStr })
        .eq("id", productId);

    if (updateError) {
        throw new Error(`Failed to store embedding for ${productId}: ${updateError.message}`);
    }

    console.log(`✅ Indexed product: ${product.name} (${productId})`);
}

/**
 * Index all products that are missing embeddings.
 * Returns the count of newly indexed products.
 */
export async function indexAllProducts(
    supabase: SupabaseClient
): Promise<{ indexed: number; errors: string[] }> {
    // First check total active products
    const { count: totalCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

    console.log(`📊 Total active products: ${totalCount}`);

    // Fetch products without embeddings
    const { data: products, error } = await supabase
        .from("products")
        .select("id, name, brand, description, metadata, embedding")
        .eq("is_active", true);

    if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!products || products.length === 0) {
        console.log("📭 No active products found in database.");
        return { indexed: 0, errors: ["No active products found in database"] };
    }

    // Filter products that need indexing (embedding is null)
    const needsIndexing = products.filter((p) => !p.embedding);
    const alreadyIndexed = products.length - needsIndexing.length;

    console.log(`📊 ${products.length} products total, ${alreadyIndexed} already indexed, ${needsIndexing.length} need indexing`);

    if (needsIndexing.length === 0) {
        return { indexed: 0, errors: [] };
    }

    console.log(`🔄 Indexing ${needsIndexing.length} products...`);

    let indexed = 0;
    const errors: string[] = [];

    for (const product of needsIndexing) {
        try {
            const embedding = await embedProduct(product);
            const embeddingStr = `[${embedding.join(",")}]`;

            const { error: updateError } = await supabase
                .from("products")
                .update({ embedding: embeddingStr })
                .eq("id", product.id);

            if (updateError) {
                errors.push(`${product.name}: ${updateError.message}`);
                console.error(`  ❌ ${product.name}: ${updateError.message}`);
                continue;
            }

            indexed++;
            console.log(`  ✅ ${indexed}/${needsIndexing.length} — ${product.name}`);

            // Small delay to respect API rate limits
            if (indexed < needsIndexing.length) {
                await new Promise((r) => setTimeout(r, 500));
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`${product.name}: ${msg}`);
            console.error(`  ❌ ${product.name}: ${msg}`);
        }
    }

    console.log(`\n✅ Indexing complete: ${indexed}/${needsIndexing.length} succeeded`);
    if (errors.length > 0) {
        console.log(`⚠️ Errors: ${errors.join("; ")}`);
    }
    return { indexed, errors };
}
