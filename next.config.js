/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['storage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizeCss: true,
    esmExternals: 'loose',
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    // Only include the 'canvas' module on the server-side
    if (isServer) {
      // Add a null-loader for the 'canvas' module in Konva during server-side rendering
      config.module.rules.push({
        test: /node_modules\/konva\/lib\/index-node\.js$/,
        use: 'null-loader',
      });
    }

    // Enable source maps in development
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    // Fix ESM modules
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Optimize chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
        react: {
          name: 'commons',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        },
      },
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