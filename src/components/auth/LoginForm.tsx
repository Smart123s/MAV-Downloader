
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, HelpCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login: authLoginHook, isLoading: authIsLoading } = useAuth(); // Renamed isLoading to avoid conflict
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for form submission
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        authLoginHook(result.username, result.token, result.expiresAt, data.rememberMe || false, data.password);
        router.push('/tickets');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message || "Invalid username or password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login form submission error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLoadingState = isSubmitting || authIsLoading;

  return (
    <TooltipProvider delayDuration={0}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="username">Username</FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    placeholder="Your MÁV Username"
                    autoComplete="username"
                    {...field}
                    className="text-base"
                  />
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
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your MÁV Password"
                    autoComplete="current-password"
                    {...field}
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
                 <div className="flex items-center gap-1 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Your MÁV password will be sent to {hostname || 'this website'}.
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs">
                      <p className="text-sm">
                        Your MÁV password needs to be sent to {hostname ? `this server (${hostname})` : 'our server'} to log you into your MÁV account.
                        It is used to retrieve your ticket information.
                        Our server only shares your password with MÁV's official API for authentication.
                        If you select "Remember my password", it will be stored in your browser.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="rememberMe"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel
                    htmlFor="rememberMe"
                    className="font-normal text-sm cursor-pointer"
                  >
                    Remember my password
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-base py-6" disabled={currentLoadingState}>
            {currentLoadingState ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {currentLoadingState ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
      </Form>
    </TooltipProvider>
  );
}
