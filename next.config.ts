import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Fix React version compatibility
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
