import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除 output: 'export' 以支持 API 路由
  // output: 'export',
  // distDir: 'docs',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
