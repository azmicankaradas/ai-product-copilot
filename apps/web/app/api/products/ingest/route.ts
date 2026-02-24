import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import {
    listCategories,
    bulkInsertProducts,
    getCurrentUser,
    type CreateProductInput,
} from "@ai-product-copilot/database";

const REQUIRED_COLUMNS = ["sku", "name", "category"];

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser(supabase);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        let rows: Record<string, string>[];

        try {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            rows = XLSX.utils.sheet_to_json<Record<string, string>>(
                workbook.Sheets[sheetName],
                { defval: "" }
            );
        } catch {
            return NextResponse.json(
                { error: "Failed to parse file. Ensure it is a valid Excel or CSV file." },
                { status: 400 }
            );
        }

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "File is empty — no data rows found." },
                { status: 400 }
            );
        }

        // Validate columns
        const columns = Object.keys(rows[0]).map((c) => c.toLowerCase().trim());
        const missingCols = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
        if (missingCols.length > 0) {
            return NextResponse.json(
                { error: `Missing required columns: ${missingCols.join(", ")}` },
                { status: 400 }
            );
        }

        // Load categories for name→id mapping
        const categories = await listCategories(supabase);
        const categoryNameMap = new Map(
            categories.map((c) => [c.name.toLowerCase(), c.id])
        );

        // Transform rows into CreateProductInput
        const products: CreateProductInput[] = [];
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // 1-indexed + header row

            // Normalize keys to lowercase
            const normalized: Record<string, string> = {};
            for (const [key, value] of Object.entries(row)) {
                normalized[key.toLowerCase().trim()] = String(value).trim();
            }

            const sku = normalized["sku"];
            const name = normalized["name"];
            const categoryName = normalized["category"];
            const description = normalized["description"] || undefined;
            const brand = normalized["brand"] || undefined;

            if (!sku || !name || !categoryName) {
                errors.push(`Row ${rowNum}: Missing required field (sku, name, or category)`);
                continue;
            }

            const categoryId = categoryNameMap.get(categoryName.toLowerCase());
            if (!categoryId) {
                errors.push(
                    `Row ${rowNum}: Unknown category "${categoryName}". Valid categories: ${categories.map((c) => c.name).join(", ")}`
                );
                continue;
            }

            // Everything else goes into metadata
            const metadata: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(normalized)) {
                if (!["sku", "name", "category", "description", "brand"].includes(key) && value) {
                    metadata[key] = value;
                }
            }

            products.push({
                tenant_id: currentUser.tenant_id,
                category_id: categoryId,
                brand,
                sku,
                name,
                description,
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                is_active: true,
            });
        }

        // Bulk insert valid products
        let inserted = 0;
        if (products.length > 0) {
            const bulkResult = await bulkInsertProducts(supabase, products);
            inserted = bulkResult.inserted;
            errors.push(...bulkResult.errors);
        }

        return NextResponse.json({
            total: rows.length,
            inserted,
            errors,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Ingestion failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
