/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: tue,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
