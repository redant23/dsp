'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from "@src/components/ThemeToggle";
import { useSession, signOut } from 'next-auth/react';
import styles from '@src/styles/components/Header.module.scss';
import { useToast } from '@src/hooks/use-toast';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();
  const { toast } = useToast();


  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: "로그아웃 성공",
        description: "로그인 화면으로 이동합니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다.",
      });
    }
  };

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.header}>
        <Link href="/">
          <div className={styles.headerTitleLink}>
            <Image
              src="/dsp-logo.svg"
              alt="로고"
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
            {status === 'authenticated' ? (
              <>
                <li className={pathname === '/mypage' ? styles.active : ''}>
                  <Link href="/mypage">내 정보</Link>
                </li>
                <li>
                  <button onClick={handleSignOut}>로그아웃</button>
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