import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Netlify deployment - no special output needed
  images: {
    unoptimized: true,
  },
  // Set turbopack root to project directory
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;