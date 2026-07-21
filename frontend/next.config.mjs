/** @type {import('next').NextConfig} */
const apiBackendUrl = process.env.API_BACKEND_URL ?? "https://micro-ats-jet.vercel.app";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
