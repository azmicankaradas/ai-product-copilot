"use client";

import { useState, useRef } from "react";

interface IngestResult {
    inserted: number;
    errors: string[];
    total: number;
}

export default function IngestPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IngestResult | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleUpload() {
        if (!file) return;

        setLoading(true);
        setParseError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/products/ingest", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setResult(data);
        } catch (err: unknown) {
            setParseError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Import Products</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Upload an Excel (.xlsx) or CSV file to bulk import products.
                </p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* File format info */}
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                    <h2 className="mb-3 text-sm font-semibold text-white">Expected Columns</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400">Column</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400">Required</th>
                                    <th className="pb-2 text-left text-xs font-semibold text-gray-400">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                <tr><td className="py-2 font-mono text-gray-300">sku</td><td className="py-2 text-green-400">✓</td><td className="py-2 text-gray-500">Unique product SKU</td></tr>
                                <tr><td className="py-2 font-mono text-gray-300">name</td><td className="py-2 text-green-400">✓</td><td className="py-2 text-gray-500">Product name</td></tr>
                                <tr><td className="py-2 font-mono text-gray-300">category</td><td className="py-2 text-green-400">✓</td><td className="py-2 text-gray-500">Category name (must match exactly)</td></tr>
                                <tr><td className="py-2 font-mono text-gray-300">description</td><td className="py-2 text-gray-600">-</td><td className="py-2 text-gray-500">Product description</td></tr>
                                <tr><td className="py-2 font-mono text-gray-300">*</td><td className="py-2 text-gray-600">-</td><td className="py-2 text-gray-500">Any other column → metadata</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upload zone */}
                <div
                    className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${file
                            ? "border-brand-500/50 bg-brand-500/5"
                            : "border-gray-700 bg-gray-900 hover:border-gray-600"
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile) setFile(droppedFile);
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                        <div>
                            <p className="text-lg font-medium text-white">📄 {file.name}</p>
                            <p className="mt-1 text-sm text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB — Click to change
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-4xl">📥</p>
                            <p className="mt-3 text-sm font-medium text-gray-300">
                                Drop your file here or click to browse
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Supports .xlsx, .xls, .csv
                            </p>
                        </div>
                    )}
                </div>

                {/* Upload button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Importing..." : "Upload & Import"}
                </button>

                {/* Error */}
                {parseError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {parseError}
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                        <h3 className="mb-3 text-sm font-semibold text-white">Import Results</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">{result.total}</p>
                                <p className="text-xs text-gray-400">Total rows</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-400">{result.inserted}</p>
                                <p className="text-xs text-gray-400">Imported</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
                                <p className="text-xs text-gray-400">Errors</p>
                            </div>
                        </div>
                        {result.errors.length > 0 && (
                            <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-gray-800 p-3">
                                {result.errors.map((err, i) => (
                                    <p key={i} className="text-xs text-red-400">
                                        {err}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
