import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@ai-product-copilot/database";

export default async function CategoriesPage() {
    const supabase = await createClient();
    const categories = await listCategories(supabase);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Categories</h1>
                <p className="mt-1 text-sm text-gray-400">
                    PPE categories with their attribute schemas. Products inherit dynamic fields from their category.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {categories.map((category) => {
                    const schema = category.attributes_schema as {
                        properties?: Record<string, { type: string; enum?: string[]; required?: string[] }>;
                        required?: string[];
                    };
                    const properties = schema?.properties ?? {};

                    return (
                        <div
                            key={category.id}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-gray-700"
                        >
                            <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                            <p className="mt-1 text-xs text-gray-500 font-mono">{category.id}</p>

                            {Object.keys(properties).length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Attribute Schema
                                    </p>
                                    <div className="space-y-2">
                                        {Object.entries(properties).map(([key, prop]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-300">
                                                        {key.replace(/_/g, " ")}
                                                    </span>
                                                    {schema?.required?.includes(key) && (
                                                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-400">
                                                            required
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded bg-gray-700 px-2 py-0.5 text-xs font-mono text-gray-400">
                                                        {prop.type}
                                                    </span>
                                                    {prop.enum && (
                                                        <span className="text-xs text-gray-500">
                                                            [{prop.enum.length} values]
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <div className="col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
                        <p className="text-sm text-gray-500">
                            No categories found. Run the SQL migration to seed the default PPE categories.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
