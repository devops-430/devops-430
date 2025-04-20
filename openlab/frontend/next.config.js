/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3000/api/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 