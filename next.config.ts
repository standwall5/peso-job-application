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

  // Force sharp installation for image optimization
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
