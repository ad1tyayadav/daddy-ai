/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase if needed
    },
  },
}

module.exports = nextConfig