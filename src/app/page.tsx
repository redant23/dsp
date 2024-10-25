'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from "@src/components/LandingPage";
import { User } from '@src/types';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/status', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setIsLoggedIn(false);
          localStorage.removeItem('token'); // 만료된 토큰 제거
          router.push('/login'); // 로그인 페이지로 리다이렉트
          return;
        }

        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        setUser(data.user);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        router.push('/login'); // 오류 발생 시 로그인 페이지로 리다이렉트
      }
    };

    checkLoginStatus();
  }, [router]);

  if (!isLoggedIn) {
    return null; // 로그인되지 않은 경우 리다이렉트 처리 중
  }

  return (
    <div className="max-xl:px-4 mx-auto max-w-screen-xl  bg-primary">
      <LandingPage user={user} />
    </div>
  );
}