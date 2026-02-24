import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    listProducts,
    createProduct,
    type ListProductsParams,
    type CreateProductInput,
} from "@ai-product-copilot/database";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const params: ListProductsParams = {
            categoryId: searchParams.get("category_id") ?? undefined,
            search: searchParams.get("search") ?? undefined,
            page: Number(searchParams.get("page")) || 1,
            pageSize: Number(searchParams.get("page_size")) || 25,
        };

        const result = await listProducts(supabase, params);
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch products";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = (await request.json()) as CreateProductInput;

        if (!body.tenant_id || !body.category_id || !body.sku || !body.name) {
            return NextResponse.json(
                { error: "Missing required fields: tenant_id, category_id, sku, name" },
                { status: 400 }
            );
        }

        const product = await createProduct(supabase, body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create product";
        if (message.includes("duplicate key")) {
            return NextResponse.json(
                { error: "A product with this SKU already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
