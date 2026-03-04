import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Silence Next.js 16: we have webpack config for build; dev uses Turbopack by default
  turbopack: {},
};

export default nextConfig;
