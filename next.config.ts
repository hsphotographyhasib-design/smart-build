import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" is removed for Vercel compatibility.
  // For local self-hosted deployment, add it back.
  // output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "z-cdn.chatglm.cn",
      },
    ],
    qualities: [75, 85, 90],
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
    "21.0.10.191",
    "21.0.11.189",
  ],
  // Packages that should not be bundled by webpack/turbopack
  // and instead use Node.js native modules at runtime.
  serverExternalPackages: ["bcryptjs", "sharp", "@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
