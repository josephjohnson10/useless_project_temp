import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '2mb',
    serverActions: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverActionTimeout: 120,
  },
};

export default nextConfig;
