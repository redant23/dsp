'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { Label } from "@src/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@src/hooks/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      localStorage.setItem('token', data.token);
      router.push('/');

    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호가 올바르지 않습니다.",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1200px] space-y-8 bg-secondary p-8 shadow-md sm:rounded-lg">
        <div className="w-full max-w-md mx-auto">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-foreground">
            로그인
          </h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-1 bg-secondary border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="mt-1 bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-accent text-accent-foreground focus:ring-ring"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-foreground">
                  로그인 상태 유지
                </label>
              </div>
              <div className="text-sm">
                <Link href="/reset-password" className="font-medium text-accent hover:text-accent/80">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              로그인
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-secondary-foreground mb-4">계정이 없으신가요?</p>
            <Link href="/signup" className="bg-accent text-white py-2 px-6 rounded-md hover:bg-accent/80 transition-colors">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
