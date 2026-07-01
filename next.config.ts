import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling server-only packages that rely on Node.js
  // built-ins (dns, net, tls, etc.). These must be required at runtime, not
  // inlined into the bundle.
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "bcryptjs",
  ],
};

export default nextConfig;
