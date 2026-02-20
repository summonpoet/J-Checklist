import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/J-Checklist',
  assetPrefix: '/J-Checklist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
