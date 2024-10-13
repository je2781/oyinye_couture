/** @type {import('next').NextConfig} */
const nextConfig = {

      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'interswitchgroup.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'cdn.jsdelivr.net',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
