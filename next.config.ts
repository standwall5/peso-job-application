import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "laqfjsjncnwugpwrahko.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // OR if you want to keep optimization, force sharp installation
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

export default nextConfig;
