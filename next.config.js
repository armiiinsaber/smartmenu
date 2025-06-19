/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // these come from ws and node-fetch; we don’t need them in the browser bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
      bufferutil: false,
      'utf-8-validate': false,
    };
    return config;
  },
};

module.exports = nextConfig;
