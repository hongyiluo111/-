/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  assetPrefix: '/',
  basePath: '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;