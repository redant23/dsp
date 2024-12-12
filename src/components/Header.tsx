'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from "@src/components/ThemeToggle";
import { useSession, signOut } from 'next-auth/react';
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
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-secondary shadow-md md:h-16 p-4 md:p-2">
      <div className="relative mx-auto flex h-12 max-w-7xl items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center justify-center h-12 md:h-8">
            <Image
              src="/images/dsp-logo.svg"
              alt="로고"
              width={140}
              height={30}
              priority
              className="h-auto w-auto min-w-[144px] md:min-w-[112px]"
            />
          </div>
        </Link>
        <button 
          onClick={handleMenuClick}
          className="block md:hidden text-primary-foreground text-2xl"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
        <nav className={`${
          menuOpen 
            ? "absolute top-full left-0 right-0 bg-primary shadow-md md:static md:shadow-none" 
            : "hidden"
          } md:block`}
        >
          <ul className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 md:p-0">
            <li>
              <ThemeToggle />
            </li>
            <li>
              <Link 
                href="/guide" 
                className={`text-primary-foreground hover:text-accent ${pathname === '/guide' ? 'text-accent' : ''}`}
              >
                사용방법
              </Link>
            </li>
            <li>
              <Link 
                href="/dsp" 
                className={`text-primary-foreground hover:text-accent ${pathname === '/dsp' ? 'text-accent' : ''}`}
              >
                배당주 포트폴리오
              </Link>
            </li>
            {status === 'authenticated' ? (
              <>
                <li>
                  <Link 
                    href="/mypage"
                    className={`text-primary-foreground hover:text-accent ${pathname === '/mypage' ? 'text-accent' : ''}`}
                  >
                    내 정보
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="text-primary-foreground hover:text-accent"
                  >
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  href="/login"
                  className={`text-primary-foreground hover:text-accent ${pathname === '/login' ? 'text-accent' : ''}`}
                >
                  로그인
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;