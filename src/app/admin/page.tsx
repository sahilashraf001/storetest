
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

// This page just serves as a redirect to the main admin orders page.
export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN_ORDERS);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Redirecting to Admin Orders...</p>
    </div>
  );
}
