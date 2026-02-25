import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    semanticSearch,
    filterSearch,
    chatWithProducts,
    type ChatMessage,
} from "@ai-product-copilot/engine";

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        // Auth check with user client
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { message, history = [] } = body as {
            message: string;
            history: ChatMessage[];
        };

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Use admin client for database operations (bypasses RLS)
        const adminClient = createAdminClient();

        // Step 1: Try semantic search first, fall back to keyword search
        let matchedProducts;
        try {
            const searchResults = await semanticSearch(adminClient, message, {
                matchThreshold: 0.25,
                matchCount: 5,
            });
            matchedProducts = searchResults.map((r) => r.product);
        } catch {
            // Fallback to keyword search if semantic search fails
            console.warn("Semantic search failed, falling back to filter search");
            matchedProducts = await filterSearch(adminClient, {}, message, 5);
        }

        // If semantic search returned nothing, also try filter search
        if (!matchedProducts || matchedProducts.length === 0) {
            matchedProducts = await filterSearch(adminClient, {}, message, 5);
        }

        // Step 2: Generate streaming response
        const stream = await chatWithProducts(message, matchedProducts, history);

        // Step 3: Return as SSE streaming response
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                const reader = stream.getReader();
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`)
                        );
                    }
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error: unknown) {
        console.error("Chat error:", error);
        const message =
            error instanceof Error ? error.message : "Chat failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
