import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable Turbopack for build (use webpack)
  experimental: {
    turbo: undefined,
  },
  // Set root directory for turbopack
  turbopack: {
    root: "/workspace/elevare-sales-os",
  },
};

export default nextConfig;
