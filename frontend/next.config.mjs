/** @type {import('next').NextConfig} */
const apiBackendUrl = process.env.API_BACKEND_URL;

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
