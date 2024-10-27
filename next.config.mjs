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
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // public/manifest.webmanifest
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Permissions-Policy',
            value: 'private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()'
          }
        ],
      },
      {
        // src/app/favicon.ico
        source: '/favicon.ico',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ],
      },
      {
        // src/app/favicon.svg 
        source: '/favicon.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
        ],
      },
    ];
  },
};

export default withSvgr(nextConfig);