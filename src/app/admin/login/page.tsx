
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ShieldCheck, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

 useEffect(() => {
    // If user is already logged in AND is an admin, redirect to admin orders
    if (!authLoading && currentUser?.isAdmin) {
      router.replace(ROUTES.ADMIN_ORDERS);
    }
  }, [currentUser, authLoading, router]);


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    // For admin login, we don't use phone, so pass empty string (or undefined if login signature changes)
    const loggedInUser = await login(data.email, data.password, ""); 
    
    if (loggedInUser && loggedInUser.isAdmin) {
      toast({
        title: "Admin Login Successful",
        description: "Redirecting to admin panel...",
      });
      const redirectUrl = searchParams.get('redirect') || ROUTES.ADMIN_ORDERS;
      router.push(redirectUrl);

    } else if (loggedInUser && !loggedInUser.isAdmin) {
        toast({
            title: "Access Denied",
            description: "This account does not have admin privileges.",
            variant: "destructive",
          });
          // Optionally log them out if they shouldn't stay logged in without admin access from this page
          // logout(); 
    } else { // This means loggedInUser is null (login failed)
      toast({
        title: "Admin Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  // If loading, or if user is logged in as admin (and redirect hasn't happened yet)
  if (authLoading || (!authLoading && currentUser?.isAdmin)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
        <ShieldCheck className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading admin access...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Administrator Login</CardTitle>
          <CardDescription>Access the {APP_NAME} Admin Panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
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
                {isSubmitting ? "Logging In..." : "Login as Admin"}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="text-center text-sm">
            <Link href={ROUTES.HOME} className="text-muted-foreground hover:text-primary">
                &larr; Back to Main Site
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
