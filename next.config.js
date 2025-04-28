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
  transpilePackages: ['konva', 'react-konva'],
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    // Enable source maps in development
    if (!isServer) {
      config.devtool = 'source-map';
      
      // Add chunk loading improvements
      config.output.chunkLoadTimeout = 60000; // Increase timeout to 60 seconds
      
      // Don't modify publicPath directly as it breaks Next.js App Router
      // Instead use assetPrefix in Next.js config if needed
    }
    
    // Add fallback for Node.js modules that might be used in browser context
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      canvas: false,
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
  async redirects() {
    return [
      {
        source: '/whiteboard',
        destination: '/whiteboard',
        permanent: true,
      },
    ];
  },
};

// Log environment configuration
console.log(`Environment Configuration: ${process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY is set' : 'OPENAI_API_KEY is NOT set'}`);

module.exports = nextConfig; 