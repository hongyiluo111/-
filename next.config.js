/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  assetPrefix: '/',
  basePath: '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-tc.tapimg.com',
      },
      {
        protocol: 'https',
        hostname: 'trae-api-cn.mchost.guru',
      },
    ],
  },
};

module.exports = nextConfig;
