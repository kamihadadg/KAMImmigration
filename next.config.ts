import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "pdfkit"],
  async redirects() {
    return [
      { source: "/resume-builder/login", destination: "/login", permanent: true },
      { source: "/resume-builder/register", destination: "/register", permanent: true }
    ];
  }
};

export default nextConfig;
