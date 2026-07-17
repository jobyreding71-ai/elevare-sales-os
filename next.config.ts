import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify deployment - no special output needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;