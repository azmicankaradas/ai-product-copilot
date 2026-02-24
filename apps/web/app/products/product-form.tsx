"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@ai-product-copilot/database";

interface ProductFormProps {
    categories: Category[];
    tenantId: string;
    initialData?: {
        id?: string;
        sku: string;
        name: string;
        description: string;
        category_id: string;
        metadata: Record<string, unknown>;
        is_active: boolean;
    };
    mode: "create" | "edit";
}

export function ProductForm({ categories, tenantId, initialData, mode }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.category_id ?? "");
    const [metadata, setMetadata] = useState<Record<string, unknown>>(initialData?.metadata ?? {});

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const schema = selectedCategory?.attributes_schema as {
        properties?: Record<string, { type: string; enum?: string[] }>;
    } | null;

    useEffect(() => {
        if (!initialData) {
            setMetadata({});
        }
    }, [selectedCategoryId, initialData]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const body = {
            tenant_id: tenantId,
            category_id: selectedCategoryId,
            sku: formData.get("sku") as string,
            name: formData.get("name") as string,
            description: (formData.get("description") as string) || undefined,
            metadata,
            is_active: formData.get("is_active") === "on",
        };

        try {
            const url = mode === "edit" ? `/api/products/${initialData?.id}` : "/api/products";
            const method = mode === "edit" ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save product");
            }

            router.push("/products");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    function updateMetadata(key: string, value: unknown) {
        setMetadata((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* SKU */}
                <div>
                    <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-gray-300">
                        SKU *
                    </label>
                    <input
                        id="sku"
                        name="sku"
                        required
                        defaultValue={initialData?.sku}
                        placeholder="e.g. SHO-S3-001"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                    />
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                        Product Name *
                    </label>
                    <input
                        id="name"
                        name="name"
                        required
                        defaultValue={initialData?.name}
                        placeholder="e.g. Uvex 2 Trend S3 Safety Boot"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label htmlFor="category_id" className="mb-1.5 block text-sm font-medium text-gray-300">
                    Category *
                </label>
                <select
                    id="category_id"
                    required
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-300 focus:border-brand-500 focus:outline-none"
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={initialData?.description}
                    placeholder="Product description..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                />
            </div>

            {/* Dynamic metadata fields based on category schema */}
            {schema?.properties && Object.keys(schema.properties).length > 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-white">
                        {selectedCategory?.name} — Category Attributes
                    </h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {Object.entries(schema.properties).map(([key, prop]) => (
                            <div key={key}>
                                <label className="mb-1.5 block text-sm font-medium text-gray-400">
                                    {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                </label>
                                {prop.enum ? (
                                    <select
                                        value={(metadata[key] as string) ?? ""}
                                        onChange={(e) => updateMetadata(key, e.target.value || undefined)}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-300 focus:border-brand-500 focus:outline-none"
                                    >
                                        <option value="">Select...</option>
                                        {prop.enum.map((val: string) => (
                                            <option key={val} value={val}>
                                                {val}
                                            </option>
                                        ))}
                                    </select>
                                ) : prop.type === "boolean" ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!metadata[key]}
                                            onChange={(e) => updateMetadata(key, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span className="text-sm text-gray-400">Yes</span>
                                    </label>
                                ) : (
                                    <input
                                        type={prop.type === "number" ? "number" : "text"}
                                        value={(metadata[key] as string) ?? ""}
                                        onChange={(e) =>
                                            updateMetadata(
                                                key,
                                                prop.type === "number" ? Number(e.target.value) : e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active toggle */}
            <label className="flex items-center gap-3">
                <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={initialData?.is_active ?? true}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-300">Product is active</span>
            </label>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 disabled:opacity-50"
                >
                    {loading ? "Saving..." : mode === "edit" ? "Update Product" : "Create Product"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
