/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ["@nodetls/napi", ...(config.externals || [])];
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      "onnxruntime-node": false,
    };
    return config;
  },
};

export default nextConfig;
