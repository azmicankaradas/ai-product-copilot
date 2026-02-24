import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    getProduct,
    updateProduct,
    deleteProduct,
    type UpdateProductInput,
} from "@ai-product-copilot/database";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const product = await getProduct(supabase, params.id);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch product";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const body = (await request.json()) as UpdateProductInput;
        const product = await updateProduct(supabase, params.id, body);
        return NextResponse.json(product);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update product";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        await deleteProduct(supabase, params.id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete product";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
