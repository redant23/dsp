'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from "@src/components/LandingPage";
import { User } from '@src/types';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        setUser(data.user);
      } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        setIsLoggedIn(false);
        router.push('/login');
      }
    };

    checkLoginStatus();
  }, [router]);

  if (!isClient) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="max-xl:px-4 mx-auto max-w-screen-xl bg-primary">
      <LandingPage user={user} />
    </div>
  );
}