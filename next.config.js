/** @type {import('next').NextConfig} */
const nextConfig = {
  // build a standalone server bundle so API routes run on Vercel
  output: "standalone",

  webpack: (config, { isServer }) => {
    // remove native-only deps from the client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
      bufferutil: false,
      "utf-8-validate": false,
    };
    return config;
  },
};

module.exports = nextConfig;
