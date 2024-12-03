import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      use: 'html-loader', // Charge les fichiers HTML comme chaînes de texte
    });
    return config;
  },
};

export default nextConfig;
