/** @type {import('next').NextConfig} */
const configuredBackendUrl = process.env.API_BACKEND_URL
  ?.replace(/\/+$/, "")
  .replace(/\/api$/, "");

// Local development should work as soon as the Express API is running.
// Vercel deployments must set API_BACKEND_URL to their backend origin.
const apiBackendUrl = configuredBackendUrl ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : undefined);

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
