/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shared'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;

