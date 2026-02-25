import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Product } from "@ai-product-copilot/database";

const CHAT_MODEL = "gemini-2.5-flash";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

function getGenAI(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Format product data into a readable context block for the LLM.
 */
function formatProductContext(products: Product[]): string {
    if (products.length === 0) return "Eşleşen ürün bulunamadı.";

    return products.map((p, i) => {
        const meta = (p.metadata || {}) as Record<string, unknown>;

        const specs: string[] = [
            `${i + 1}. **${p.brand} ${p.name}** (SKU: ${p.sku})`,
        ];

        if (p.description) {
            specs.push(`   Açıklama: ${p.description.substring(0, 200)}...`);
        }

        const keyFields: [string, string][] = [
            ["protection_class", "Koruma Sınıfı"],
            ["toe_cap_material", "Burun Koruma"],
            ["standard", "Standart"],
            ["closure_system", "Bağlama Sistemi"],
            ["outsole_material", "Taban"],
            ["weight_grams", "Ağırlık (g)"],
            ["shoe_type", "Tip"],
            ["electrical_hazard", "EH Koruma"],
            ["antistatic", "Antistatik"],
            ["water_resistant", "Su Direnci"],
            ["anti_perforation", "Anti-delinme"],
            ["cold_insulation", "Soğuk Yalıtım"],
            ["heat_insulation", "Isı Yalıtım"],
            ["heat_resistant_outsole_temp", "Isıya Dayanıklı Taban (°C)"],
        ];

        for (const [key, label] of keyFields) {
            if (meta[key] !== undefined && meta[key] !== null) {
                const val = typeof meta[key] === "boolean"
                    ? (meta[key] ? "Evet" : "Hayır")
                    : String(meta[key]);
                specs.push(`   ${label}: ${val}`);
            }
        }

        if (meta.industries && Array.isArray(meta.industries)) {
            specs.push(`   Sektörler: ${(meta.industries as string[]).join(", ")}`);
        }

        return specs.join("\n");
    }).join("\n\n");
}

const SYSTEM_PROMPT = `Sen GTC Industrial şirketinin AI ürün asistanısın. Kişisel Koruyucu Donanım (KKD / PPE) konusunda uzman bir danışmansın.

Görevin:
1. Kullanıcının ihtiyaçlarını anlamak (sektör, çalışma koşulları, tehlikeler)
2. Veritabanındaki ürünlerden en uygun olanları önermek
3. Önerilerini teknik gerekçelerle desteklemek
4. Türkçe yanıt vermek

Kurallar:
- Her zaman Türkçe yanıt ver
- Ürün önerirken mutlaka teknik özelliklerini belirt (koruma sınıfı, standart, malzeme vb.)
- Ürünleri karşılaştırırken avantaj/dezavantajlarını açıkça belirt
- Eğer uygun ürün yoksa bunu dürüstçe söyle
- Kullanıcıya sektörüne ve ihtiyacına göre en doğru ürünü seç
- Güvenlik standartlarını (EN ISO 20345, ASTM F2413 vb.) açıkla
- Kısa, net ve profesyonel ol`;

/**
 * Generate a streaming chat response using Gemini.
 */
export async function chatWithProducts(
    userMessage: string,
    matchedProducts: Product[],
    history: ChatMessage[] = []
): Promise<ReadableStream<string>> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: CHAT_MODEL,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            // @ts-expect-error - thinkingConfig exists but not typed yet
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const productContext = formatProductContext(matchedProducts);

    const augmentedMessage = `
## Eşleşen Ürünler (Veritabanından)
${productContext}

## Kullanıcı Sorusu
${userMessage}

Yukarıdaki ürün bilgilerini kullanarak kullanıcının sorusunu yanıtla. Sadece veritabanındaki ürünleri öner.`;

    const chatHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessageStream(augmentedMessage);

    return new ReadableStream<string>({
        async start(controller) {
            try {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(text);
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

/**
 * Non-streaming version for simpler use cases.
 */
export async function chatWithProductsSync(
    userMessage: string,
    matchedProducts: Product[],
    history: ChatMessage[] = []
): Promise<string> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: CHAT_MODEL,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            // @ts-expect-error - thinkingConfig exists but not typed yet
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const productContext = formatProductContext(matchedProducts);
    const augmentedMessage = `
## Eşleşen Ürünler (Veritabanından)
${productContext}

## Kullanıcı Sorusu
${userMessage}

Yukarıdaki ürün bilgilerini kullanarak kullanıcının sorusunu yanıtla. Sadece veritabanındaki ürünleri öner.`;

    const chatHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(augmentedMessage);
    return result.response.text();
}
