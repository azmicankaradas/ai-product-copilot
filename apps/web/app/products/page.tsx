import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProducts, listCategories } from "@ai-product-copilot/database";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { page?: string; category_id?: string; search?: string };
}) {
    const supabase = await createClient();

    const [result, categories] = await Promise.all([
        listProducts(supabase, {
            page: Number(searchParams.page) || 1,
            pageSize: 20,
            categoryId: searchParams.category_id,
            search: searchParams.search,
        }),
        listCategories(supabase),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {result.count} product{result.count !== 1 ? "s" : ""} in catalog
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/products/ingest"
                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800"
                    >
                        📥 Import
                    </Link>
                    <Link
                        href="/products/new"
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500"
                    >
                        + Add Product
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <form className="flex flex-1 gap-3">
                    <input
                        name="search"
                        type="text"
                        placeholder="Search by name or SKU..."
                        defaultValue={searchParams.search}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-brand-500 focus:outline-none"
                    />
                    <select
                        name="category_id"
                        defaultValue={searchParams.category_id}
                        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-800">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50">
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {result.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No products found. Add your first product or import from Excel.
                                </td>
                            </tr>
                        ) : (
                            result.data.map((product) => (
                                <tr
                                    key={product.id}
                                    className="transition-colors hover:bg-gray-900/50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-300">
                                        {product.sku}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-white">{product.name}</p>
                                        {product.description && (
                                            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                                                {product.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                                            {categoryMap.get(product.category_id) ?? "—"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${product.is_active
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-red-500/10 text-red-400"
                                                }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-green-500" : "bg-red-500"
                                                    }`}
                                            />
                                            {product.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <Link
                                            href={`/products/${product.id}/edit`}
                                            className="text-sm text-brand-400 hover:text-brand-300"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Page {result.page} of {result.totalPages}
                    </p>
                    <div className="flex gap-2">
                        {result.page > 1 && (
                            <Link
                                href={`/products?page=${result.page - 1}${searchParams.category_id ? `&category_id=${searchParams.category_id}` : ""
                                    }${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
                            >
                                ← Previous
                            </Link>
                        )}
                        {result.page < result.totalPages && (
                            <Link
                                href={`/products?page=${result.page + 1}${searchParams.category_id ? `&category_id=${searchParams.category_id}` : ""
                                    }${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
