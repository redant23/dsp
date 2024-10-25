'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from "@src/components/LandingPage";
import { User } from '@src/types';


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  

  useEffect(() => {
    
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    const checkLoginStatus = async () => {
      const response = await fetch('/api/auth/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      const loggedIn = data.isAuthenticated;
      setIsLoggedIn(loggedIn);
      setUser(data.user);

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
    <div className="bg-primary">
      <LandingPage user={user} />
    </div>
  );
}