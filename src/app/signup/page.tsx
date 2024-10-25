'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@src/hooks/use-toast";

import { Button } from "@src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import { Input } from "@src/components/ui/input";
 
const formSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다."),
  password: z.string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .regex(/^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*?_]).{8,}$/, "비밀번호에는 특수문자가 1개 이상 포함되어야 합니다."),
  confirmPassword: z.string()
    .min(8, "비밀번호 확인은 최소 8자 이상이어야 합니다.")
    .regex(/^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*?_]).{8,}$/, "비밀번호 확인에는 특수문자가 1개 이상 포함되어야 합니다."),
  phone: z.string()
    .min(10, "전화번호는 최소 10자 이상이어야 합니다.")
    .regex(/^01\d-\d{4}-\d{4}$/, "010-1234-5678 형식으로 입력해주세요."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const checkEmail = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 400) {
        form.setError('email', { message: data.message });
      }
    } catch (error) {
      form.setError('email', { message: '이메일에 문제가 있습니다. 관리자에게 문의하세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        form.reset();
        // 회원가입 완료 메시지 표시
        toast({
          title: "회원가입 완료",
          description: "성공적으로 가입되었습니다. 로그인 페이지로 이동합니다.",
          duration: 2000,
        });
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } else {
        form.setError("root", { message: data.message });
      }
    } catch (error) {
      form.setError("root", { message: '서버 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1200px] space-y-8 bg-secondary text-secondary-foreground p-8 shadow-md sm:rounded-lg">
        <div className="w-full max-w-md mx-auto">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-secondary-foreground">
            회원가입
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary-foreground">이메일 주소</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className={`mt-1 bg-secondary text-secondary-foreground ${form.formState.errors.email ? 'border-destructive' : ''}`}
                        onBlur={() => checkEmail(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>닉네임</FormLabel>
                    <FormControl>
                      <Input {...field} className="mt-1 bg-secondary text-secondary-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="mt-1 bg-secondary text-secondary-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="mt-1 bg-secondary text-secondary-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>핸드폰 번호</FormLabel>
                    <FormControl>
                      <Input {...field} className="mt-1 bg-secondary text-secondary-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                className="w-full bg-accent disabled:bg-muted hover:bg-accent/90 text-accent-foreground" 
                type="submit" 
                disabled={isLoading || !form.formState.isValid || Object.keys(form.formState.errors).length > 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                회원가입
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;