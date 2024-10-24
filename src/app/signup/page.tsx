'use client';

import { useState } from 'react';
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { Label } from "@src/components/ui/label";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

 

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1200px] space-y-8 bg-secondary text-secondary-foreground p-8 shadow-md sm:rounded-lg">
        <div className="w-full max-w-md mx-auto">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-secondary-foreground">
            회원가입
          </h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호 확인</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            <div>
              <Label htmlFor="parentName">이름</Label>
              <Input
                id="parentName"
                name="parentName"
                type="text"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            <div>
              <Label htmlFor="parentPhone">핸드폰 번호</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="text"
                required
                className="mt-1 bg-secondary text-secondary-foreground"
              />
            </div>
            
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              회원가입
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
