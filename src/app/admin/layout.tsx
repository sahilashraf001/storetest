
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { ROUTES } from '@/lib/constants';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Ensure this is the correct import

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If on the admin login page, don't run the auth checks here
    // The admin login page will handle its own logic (e.g., redirecting if already admin)
    if (pathname === ROUTES.ADMIN_LOGIN) {
      return;
    }

    if (!authLoading) {
      if (!isAuthenticated || !currentUser?.isAdmin) {
        // Redirect non-admins or unauthenticated users to the admin login page
        // Include current path as redirect query for better UX after login
        router.replace(`${ROUTES.ADMIN_LOGIN}?redirect=${pathname}`); 
      }
    }
  }, [currentUser, authLoading, isAuthenticated, router, pathname]);

  // If on the admin login page, render children directly.
  // The login page itself handles redirection if admin is already logged in.
  if (pathname === ROUTES.ADMIN_LOGIN) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // This fallback is if user is somehow authenticated but not an admin,
  // or if the redirect in useEffect is slow.
  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground">You do not have permission to view this page. Please log in as an administrator.</p>
        <Button onClick={() => router.push(ROUTES.ADMIN_LOGIN)} className="mt-6">
          Go to Admin Login
        </Button>
      </div>
    );
  }

  // If admin, render the children (the actual admin page)
  return <>{children}</>;
}
