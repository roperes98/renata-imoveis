import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'https://supabase.360renataimoveis.com/storage/v1/object/public/real-estate-images/:path*',
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imobiliario.inter.co",
      },
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
