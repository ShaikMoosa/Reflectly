/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  // swcMinify: false,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: false,
    esmExternals: 'loose',
  },
  // Configure server port
  serverRuntimeConfig: {
    port: 3001, // Use port 3001 as an alternative
  },
  // Explicitly enable the CSS optimizations
  optimizeFonts: false,
  compiler: {
    // Remove console logs only in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'debug', 'info'],
    } : false,
  },
  // Configure webpack for better optimization
  webpack: (config, { isServer, dev }) => {
    // Enable source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    // Handle ESM modules properly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Add module name debug information
    config.optimization.moduleIds = 'named';

    // Optimize chunks
    config.optimization.runtimeChunk = 'single';
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name from the package name
            const packageName = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] || 'unknown';
            // Return a readable name
            return `vendor.${packageName.replace('@', '')}`;
          },
          priority: 5,
        },
      },
    };

    // Log webpack configuration at startup
    if (!isServer && dev) {
      console.log('Webpack optimization settings:', JSON.stringify({
        runtimeChunk: config.optimization.runtimeChunk,
        splitChunks: config.optimization.splitChunks,
      }, null, 2));
    }

    return config;
  },
};

// Force disable telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

module.exports = nextConfig; 