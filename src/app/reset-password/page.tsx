'use client';

import { useState } from 'react';
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { Label } from "@src/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetTokenValid, setResetTokenValid] = useState(false);
  const [resetStage] = useState<'email' | 'reset'>('email');

  async function handleSendResetEmail(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    // Simulate email send
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 2000);
  }

  async function handleResetPassword(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false);
      setResetTokenValid(true);
    }, 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[600px] space-y-8 bg-secondary text-secondary-foreground p-8 shadow-md sm:rounded-lg">
        <div className="w-full max-w-md mx-auto">
          {resetStage === 'email' && (
            <>
              <h2 className="mb-6 text-center text-3xl font-extrabold text-secondary-foreground">
                비밀번호 재설정
              </h2>
              <form className="space-y-6" onSubmit={handleSendResetEmail}>
                <div>
                  <Label htmlFor="email">가입된 이메일 주소</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 bg-secondary text-secondary-foreground"
                  />
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  재설정 이메일 전송
                </Button>
                {emailSent && (
                  <p className="mt-4 text-sm text-green-500">재설정 링크가 포함된 이메일을 전송했습니다. 메일함을 확인해주세요.</p>
                )}
              </form>
            </>
          )}

          {resetStage === 'reset' && resetTokenValid && (
            <>
              <h2 className="mb-6 text-center text-3xl font-extrabold text-secondary-foreground">
                비밀번호 재설정
              </h2>
              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="mt-1 bg-secondary text-secondary-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 bg-secondary text-secondary-foreground"
                  />
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  비밀번호 재설정
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
