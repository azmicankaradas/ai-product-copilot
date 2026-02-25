import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 3072;

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAIInstance) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set");
        }
        genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return genAIInstance;
}

/**
 * Generate a vector embedding for the given text using Gemini text-embedding-004.
 * Returns a 768-dimensional float array.
 */
export async function embedText(text: string): Promise<number[]> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

    const result = await model.embedContent(text);
    return result.embedding.values;
}

/**
 * Build a rich text representation of a product for embedding.
 */
export function buildProductText(product: {
    name: string;
    brand?: string | null;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
}): string {
    const parts: string[] = [];

    if (product.brand) {
        parts.push(`Marka: ${product.brand}`);
    }
    parts.push(`Ürün: ${product.name}`);

    if (product.description) {
        parts.push(product.description);
    }

    if (product.metadata && typeof product.metadata === "object") {
        const meta = product.metadata;
        const fieldLabels: Record<string, string> = {
            protection_class: "Koruma Sınıfı",
            toe_cap_material: "Burun Koruma Malzemesi",
            slip_resistance: "Kayma Direnci",
            upper_material: "Üst Malzeme",
            outsole_material: "Taban Malzemesi",
            anti_perforation: "Anti-delinme Koruma",
            antistatic: "Antistatik",
            electrical_hazard: "Elektrik Tehlikesi Koruması (EH)",
            water_resistant: "Su Direnci",
            closure_system: "Bağlama Sistemi",
            standard: "Standart",
            impact_protection_joules: "Çarpma Koruması (Joule)",
            shoe_type: "Ayakkabı Tipi",
            weight_grams: "Ağırlık (gram)",
            cold_insulation: "Soğuk Yalıtım",
            heat_insulation: "Isı Yalıtım",
            heat_resistant_outsole: "Isıya Dayanıklı Taban",
            vegan_friendly: "Vegan Uyumlu",
            non_metallic: "Metal İçermez",
            eh_voltage: "EH Voltaj",
        };

        for (const [key, value] of Object.entries(meta)) {
            if (value === null || value === undefined) continue;
            const label = fieldLabels[key] || key;
            if (typeof value === "boolean") {
                parts.push(`${label}: ${value ? "Evet" : "Hayır"}`);
            } else if (Array.isArray(value)) {
                parts.push(`${label}: ${value.join(", ")}`);
            } else {
                parts.push(`${label}: ${value}`);
            }
        }
    }

    return parts.join("\n");
}

/**
 * Generate embedding for a product by building rich text and embedding it.
 */
export async function embedProduct(product: {
    name: string;
    brand?: string | null;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
}): Promise<number[]> {
    const text = buildProductText(product);
    return embedText(text);
}

export { EMBEDDING_DIMENSION };
