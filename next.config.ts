import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fotos.sobressai.com.br",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.quintoandar.com.br",
      },
      {
        protocol: "https",
        hostname: "hansenimoveis.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    // Skip image optimization in development to avoid strict loader checks.
    unoptimized: isDev,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumentado para suportar imagens maiores com marca d'água
    },
  },
};

export default nextConfig;
