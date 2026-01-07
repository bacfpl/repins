import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Tối ưu hóa cache và loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Giảm quality tối đa để cân bằng tốc độ
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 năm
  },
};

export default nextConfig;
