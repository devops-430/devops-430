/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/image': require.resolve('next/image'),
    };
    return config;
  },
  // Allow cross-origin requests during development
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://openlab.nnine.training/api/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 
