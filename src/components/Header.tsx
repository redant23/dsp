'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi'; // 아이콘 사용

import ThemeToggle from "@src/components/ThemeToggle";
import styles from '@src/styles/components/Header.module.scss';


const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
    };

    handleRouteChange();

    // 로그인 상태 확인 (임시 로직)
    const checkLoginStatus = () => {
      // 실제 로그인 상태 확인 로직으로 대체해야 합니다.
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();

    return () => {
      // 클린업 함수 (필요한 경우)
    };
  }, [pathname]);

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // 로그아웃 로직 구현
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
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
