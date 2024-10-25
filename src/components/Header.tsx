'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi'; // 아이콘 사용

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

  const checkLoginStatus = () => {
    const hasToken = localStorage.getItem('token') !== null;
    const tokenExpired = isTokenExpired(localStorage.getItem('token'));

    if (hasToken && !tokenExpired) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    
    const parts = token.split('.');
    if (parts.length !== 3) return true; // 유효하지 않은 토큰 구조

    const base64Url = parts[1];
    if (!base64Url) return true; // 페이로드 부분이 없는 경우

    // base64Url 형식 검증
    const base64UrlRegex = /^[A-Za-z0-9-_]+$/;
    if (!base64UrlRegex.test(base64Url)) return true; // 유효하지 않은 base64Url 형식

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    const { exp } = JSON.parse(jsonPayload);
    const expired = Date.now() >= exp * 1000;
    
    return expired;
  };

  useEffect(() => {
    handleRouteChange();
    checkLoginStatus();

    return () => {
      // 클린업 함수 (필요한 경우)
    };
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
