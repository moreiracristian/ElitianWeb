import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const apiHost = process.env.NEXT_PUBLIC_API_HOST ?? 'localhost'

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['172.17.96.1'],
  images: {
    remotePatterns: [
      {
        protocol: isProd ? 'https' : 'http',
        hostname: apiHost,
        ...(isProd ? {} : { port: '8000' }),
        pathname: '/media/**',
      },
    ],
  },
}

export default nextConfig