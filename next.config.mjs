// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://sheleadsafrica.org",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://sheleadsafrica.org",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://sheleadsafrica.org",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;