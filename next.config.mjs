import withSvgr from 'next-svgr';
import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // 빌드 ID 생성 함수 추가
  generateBuildId: async () => {
    // 마지막 커밋 해시를 빌드 ID로 사용
    return execSync('git rev-parse HEAD').toString().trim();
  }
};

export default withSvgr(nextConfig);