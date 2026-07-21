/** @type {import('next').NextConfig} */
const apiBackendUrl = process.env.API_BACKEND_URL
  ?.replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig = {
  async rewrites() {
    if (!apiBackendUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
