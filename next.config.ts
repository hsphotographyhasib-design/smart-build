import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The start script and .zscripts/build.sh both serve .next/standalone/server.js;
  // without this the standalone bundle is never emitted and `bun run start` fails.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
    "21.0.10.191",
  ],
};

export default nextConfig;
