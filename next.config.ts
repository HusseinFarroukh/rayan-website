/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'kssnedhqsfudxtstevmx.supabase.co',
      'localhost', // for local development
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kssnedhqsfudxtstevmx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],
  },
}

module.exports = nextConfig