import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Set root directory for turbopack
  turbopack: {
    root: "/workspace/elevare-sales-os",
  },
};

export default nextConfig;
