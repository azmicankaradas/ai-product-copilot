import { login, signup } from "./actions";

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string };
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-brand-950 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        AI Product Copilot
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        B2B PPE Recommendation Platform
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                    <h2 className="mb-6 text-xl font-semibold text-white">
                        Sign in to your account
                    </h2>

                    {/* Error message */}
                    {searchParams?.error && (
                        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {searchParams.error}
                        </div>
                    )}

                    {/* Success message */}
                    {searchParams?.message && (
                        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            {searchParams.message}
                        </div>
                    )}

                    <form className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-gray-300"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@company.com"
                                className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-white placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-gray-300"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-white placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                formAction={login}
                                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                Sign In
                            </button>
                            <button
                                formAction={signup}
                                className="w-full rounded-lg border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    Powered by GTC Industrial &middot; Multi-Tenant PPE Platform
                </p>
            </div>
        </main>
    );
}
