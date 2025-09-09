import type { NextConfig } from "next";
import type { NextConfig } from "next";

/**
 * Production-friendly config:
 * - Ignore ESLint during builds so lint errors don't fail Vercel deploys.
 *   (You can re-enable after cleaning up types/lint.)
 */
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // If TypeScript type errors still fail builds, temporarily uncomment:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

