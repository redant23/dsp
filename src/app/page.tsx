'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from "@src/components/LandingPage";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 여기에 로그인 상태를 확인하는 로직을 추가해야 합니다.
    // 예를 들어, 세션이나 토큰을 확인하는 등의 작업을 수행합니다.
    const checkLoginStatus = () => {
      // 로그인 상태 확인 로직
      // 임시로 false로 설정했습니다. 실제 로직으로 대체해야 합니다.
      const loggedIn = false;
      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        router.push('/login'); // 로그인 페이지로 리다이렉트
      }
    };

    checkLoginStatus();
  }, [router]);

  if (!isLoggedIn) {
    return null; // 로그인되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 처리 중)
  }

  return (
    <div>
      <LandingPage />
    </div>
  );
}