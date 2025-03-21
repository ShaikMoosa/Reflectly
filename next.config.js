/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig; 