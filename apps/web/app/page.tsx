import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch stats
    const [productsRes, categoriesRes, sessionsRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
    ]);

    const stats = [
        {
            label: "Total Products",
            value: productsRes.count ?? 0,
            icon: "📦",
            color: "from-blue-500 to-blue-600",
        },
        {
            label: "Categories",
            value: categoriesRes.count ?? 0,
            icon: "🏷️",
            color: "from-emerald-500 to-emerald-600",
        },
        {
            label: "Chat Sessions",
            value: sessionsRes.count ?? 0,
            icon: "💬",
            color: "from-purple-500 to-purple-600",
        },
        {
            label: "System Status",
            value: "Online",
            icon: "🟢",
            color: "from-green-500 to-green-600",
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Overview of your PPE product catalog
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-gray-700"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mt-10">
                <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <a
                        href="/products/new"
                        className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-brand-500/50 hover:bg-gray-800"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-xl">
                            ➕
                        </div>
                        <div>
                            <p className="font-medium text-white">Add Product</p>
                            <p className="text-xs text-gray-400">Create a new PPE product</p>
                        </div>
                    </a>
                    <a
                        href="/products/ingest"
                        className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-emerald-500/50 hover:bg-gray-800"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-xl">
                            📥
                        </div>
                        <div>
                            <p className="font-medium text-white">Import Products</p>
                            <p className="text-xs text-gray-400">Upload Excel/CSV file</p>
                        </div>
                    </a>
                    <a
                        href="/categories"
                        className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-purple-500/50 hover:bg-gray-800"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-xl">
                            🏷️
                        </div>
                        <div>
                            <p className="font-medium text-white">View Categories</p>
                            <p className="text-xs text-gray-400">PPE attribute schemas</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
