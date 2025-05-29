
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Shield } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or Phone Number is required." })
    .refine(val => {
      const isEmail = emailRegex.test(val);
      const isPhone = phoneRegex.test(val) && val.length >= 10;
      return isEmail || isPhone;
    }, { message: "Invalid email or phone number format. Please enter a valid email or a phone number with at least 10 digits." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

 useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace(ROUTES.PROFILE); // Or ROUTES.HOME
    }
  }, [currentUser, authLoading, router]);


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    let emailInput = "";
    let phoneInput = "";

    if (emailRegex.test(data.identifier)) {
      emailInput = data.identifier;
    } else if (phoneRegex.test(data.identifier)) {
      phoneInput = data.identifier;
    }
    // The Zod schema's refine should catch invalid formats before this point.

    const success = await login(emailInput, data.password, phoneInput);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push(ROUTES.HOME); // Or a dashboard/profile page
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or user not found. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading || (!authLoading && currentUser)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Shield className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back</CardTitle>
          <CardDescription>Login to your {APP_NAME} account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com or 9876543210"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || authLoading}>
                {isSubmitting ? "Logging In..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto font-semibold">
              <Link href={ROUTES.SIGNUP}>Sign up</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
