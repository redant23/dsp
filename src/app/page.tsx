'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Main from '@src/components/Main';
import { User } from '@src/types';

export default function Home() {
  const { data, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
 
      if (data?.user) {
        const user: User = {
          id: data.user.id || '',
          email: data.user.email || '',
          nickname: data.user.nickname || '',
          phone: data.user.phone || '',
        };
        setUser(user);
      }
    };

    checkLoginStatus();
  }, [status, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-xl:px-4 mx-auto max-w-screen-xl">
      <Main />
    </div>
  );
}