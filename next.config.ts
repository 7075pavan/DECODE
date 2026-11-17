import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    const firebaseHost = "decode-be09a.firebaseapp.com";
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseHost}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/init.json",
        destination: `https://${firebaseHost}/__/firebase/init.json`,
      },
    ];
  },
};

export default nextConfig;
