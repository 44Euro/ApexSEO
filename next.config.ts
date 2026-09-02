import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev and dev:cms run two servers off one checkout; without separate build
  // directories they overwrite each other's manifests and serve 404s.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
