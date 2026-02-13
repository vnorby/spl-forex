import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@solafx/sdk", "@solafx/ui", "@solafx/types"],
};

export default nextConfig;
