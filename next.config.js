/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: false,
  images: {
    domains: ['localhost'],
  },
  
  // Disable experimental features that could cause issues
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: [],
  },
  
  // Share environment variables with the client
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  
  // Simplify webpack config to avoid module issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks for browser-only code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    
    // Disable chunk splitting to simplify bundling
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;
    
    return config;
  },
  
  // Redirect problematic paths to static alternatives
  async redirects() {
    return [
      {
        source: '/whiteboard',
        destination: '/test',
        permanent: false,
      },
    ];
  },
};

// Disable telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

module.exports = nextConfig; 