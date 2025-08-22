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
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://sheleadsafrica.org/", // optional legacy
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sheleadsafrica.org/ https://sheleadsafrica.org/;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
