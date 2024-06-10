/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => [
        {
            source: "/static/:slug*",
            destination: `${process.env.BACKEND_URL}/static/:slug*`,
        },
        {
            source: "/api/:slug*",
            // trailing slash in destination is required
            destination: `${process.env.BACKEND_URL}/api/:slug*/`,
        }
    ],
};

export default nextConfig;
