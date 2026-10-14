/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const apiHost = process.env.INTERNAL_API_URL || 'http://127.0.0.1:3001';
    return [
      {
        source: '/api-backend/:path*',
        destination: `${apiHost}/:path*`,
      },
      {
        source: '/docs/:path*',
        destination: `${apiHost}/docs/:path*`,
      },
      {
        source: '/docs',
        destination: `${apiHost}/docs`,
      },
      {
        source: '/health',
        destination: `${apiHost}/health`,
      },
    ];
  },
};

module.exports = nextConfig;
