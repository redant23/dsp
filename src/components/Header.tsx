'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

import ThemeToggle from "@src/components/ThemeToggle";
import styles from '@src/styles/components/Header.module.scss';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleRouteChange = () => {
    setMenuOpen(false);
  };

  const checkLoginStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('token'); // 만료된 토큰 제거
      }
    } catch (error) {
      console.error('Failed to check token:', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    handleRouteChange();
    checkLoginStatus();
  }, [pathname]);

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.header}>
        <Link href="/">
          <div className={styles.headerTitleLink}>
            <Image
              src="/dsp-logo.svg"
              alt="logo"
              width={140}
              height={30}
              priority
            />
          </div>
        </Link>
        <div className={styles.menuIcon} onClick={handleMenuClick}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </div>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <ul>
            <li>
              <ThemeToggle />
            </li>
            <li className={pathname === '/guide' ? styles.active : ''}>
              <Link href="/guide">사용방법</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className={pathname === '/mypage' ? styles.active : ''}>
                  <Link href="/mypage">내 정보</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>로그아웃</button>
                </li>
              </>
            ) : (
              <li className={pathname === '/login' ? styles.active : ''}>
                <Link href="/login">로그인</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;