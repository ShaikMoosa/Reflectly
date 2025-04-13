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
    esmExternals: 'loose',
  },
  // Explicitly enable the CSS optimizations
  optimizeFonts: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig; 