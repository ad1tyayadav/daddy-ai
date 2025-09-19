/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.tenor.com/',
        port: '',
        pathname: '/my-bucket/**',
        search: '',
      },
    ],
  },
}
 
module.exports = nextConfig