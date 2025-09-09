import type { NextConfig } from "next";

/**
 * Keep ESLint off during Vercel builds.
 * If you ever need to bypass TS errors temporarily, flip ignoreBuildErrors to true.
 */
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
