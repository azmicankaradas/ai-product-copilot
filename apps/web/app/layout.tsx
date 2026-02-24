import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Product Copilot — PPE Platform",
    description: "B2B AI-powered PPE product recommendation platform",
};

const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/products", label: "Products", icon: "📦" },
    { href: "/categories", label: "Categories", icon: "🏷️" },
    { href: "/products/ingest", label: "Import", icon: "📥" },
];

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If not logged in, render children without sidebar (login page)
    if (!user) {
        return (
            <html lang="en">
                <body className="bg-gray-950 text-white antialiased">
                    {children}
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body className="bg-gray-950 text-white antialiased">
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-800 bg-gray-900">
                        {/* Brand */}
                        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20">
                                <span className="text-sm font-bold text-white">AI</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Product Copilot</p>
                                <p className="text-xs text-gray-500">PPE Platform</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-1 px-3 py-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* User footer */}
                        <div className="border-t border-gray-800 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-gray-300">
                                    {user.email?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <form action={signout} className="mt-3">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-600 hover:bg-gray-800 hover:text-white"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="ml-64 flex-1">{children}</main>
                </div>
            </body>
        </html>
    );
}
