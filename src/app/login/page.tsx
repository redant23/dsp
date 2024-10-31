'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { useToast } from "@src/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: result.error,
        });
      } else {
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "로그인 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-foreground">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="border-input bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              비밀번호
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="border-input bg-background text-foreground"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link 
              href="/reset-password" 
              className="text-accent hover:text-accent/80 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-primary-foreground">계정이 없으신가요? </span>
            <Link 
              href="/signup" 
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
