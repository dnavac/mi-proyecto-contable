import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Agregamos la redirección para que /api/docs apunte a /docs
  async rewrites() {
    return [
      {
        source: "/api/docs", // Lo que el usuario escribe en la URL
        destination: "/docs", // La página real (docs.tsx) a la que apunta por debajo
      },
    ];
  },
};

export default nextConfig;
