import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests', // 테스트 파일 위치
  timeout: 30000, // 테스트 타임아웃
  expect: {
    timeout: 5000, // expect() 타임아웃
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // CI 환경에서 test.only() 금지
  retries: process.env.CI ? 1 : 0, // CI 환경에서만 재시도
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }], // HTML 리포트 생성
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // 실패한 테스트의 트레이스 저장
    screenshot: 'only-on-failure', // 실패한 테스트의 스크린샷 저장
  },
});
