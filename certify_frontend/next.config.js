/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5200/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
