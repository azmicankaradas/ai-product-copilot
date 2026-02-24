/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "@ai-product-copilot/database",
        "@ai-product-copilot/ui",
        "@ai-product-copilot/engine",
    ],
};

export default nextConfig;
