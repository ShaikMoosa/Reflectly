/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['storage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    esmExternals: true,
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    // Enable source maps in development
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    // Add fallback for Node.js modules that might be used in browser context
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3001,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
};

// Log environment configuration
console.log(`Environment Configuration: ${process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY is set' : 'OPENAI_API_KEY is NOT set'}`);

module.exports = nextConfig; 