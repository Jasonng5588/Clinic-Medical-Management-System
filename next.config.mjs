/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during production builds (Vercel)
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable TypeScript type checking during production builds
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'zsgfauenaxgpjgsthhef.supabase.co',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
}

export default nextConfig
