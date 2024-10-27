import withSvgr from 'next-svgr';
import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  generateBuildId: async () => {
    return execSync('git rev-parse HEAD').toString().trim();
  },
  webpack: (config, { isServer }) => {
    // ts-loader 설정 추가
    config.module.rules.push({
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    });

    config.resolve.extensions.push('.ts');

    return config;
  },
};

export default withSvgr(nextConfig);