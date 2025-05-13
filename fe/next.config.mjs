/** @type {import('next').NextConfig} */

// Import the 'path' module
import path from 'path';

const nextConfig = {
  experimental: {
    ppr: false,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['localhost']
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      jotai: path.resolve('./node_modules/jotai'),
    };

    return config;
  },
};

export default nextConfig;
