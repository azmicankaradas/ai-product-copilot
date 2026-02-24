import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@ai-product-copilot/database";

export async function GET() {
    try {
        const supabase = await createClient();
        const categories = await listCategories(supabase);
        return NextResponse.json(categories);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch categories";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
