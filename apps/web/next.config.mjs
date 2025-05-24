const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "interswitchgroup.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: [
    "ui",
    "helpers",
    "interfaces",
    "locales",
    "middleware",
    "models",
    "templates",
    "shared-assets",
    "store",
  ],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
