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
    "21.0.11.189",
  ],
};

export default nextConfig;
