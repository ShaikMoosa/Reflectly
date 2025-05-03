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
      config.devtool = 'eval-source-map';
      
      // Add chunk loading improvements
      config.output.chunkLoadTimeout = 120000; // Increase timeout to 120 seconds
      
      // Optimize chunk sizes
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Extract framework code from app code
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Bundle larger libraries separately
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Safe check for module.context to avoid errors
              if (!module.context) return 'lib';
              
              const contextMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!contextMatch) return 'lib';
              
              const packageName = contextMatch[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Common app code
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          // Styles
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
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
    port: process.env.PORT || 3000,
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