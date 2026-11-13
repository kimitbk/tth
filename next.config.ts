import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside another Next.js project; keep its root here.
  turbopack: { root: __dirname },
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
