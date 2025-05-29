
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Phone, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = `My Profile | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace(ROUTES.LOGIN + `?redirect=${ROUTES.PROFILE}`);
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>View and manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm"><User className="h-4 w-4 text-muted-foreground" />Full Name</Label>
            <Input id="name" value={currentUser.name} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />Email Address</Label>
            <Input id="email" type="email" value={currentUser.email} readOnly className="bg-muted/50" />
          </div>
          {currentUser.phone && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />Phone Number</Label>
              <Input id="phone" type="tel" value={currentUser.phone} readOnly className="bg-muted/50" />
            </div>
          )}
          <div className="pt-2">
            <Button variant="secondary" disabled> {/* Placeholder for edit functionality */}
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for other profile sections like Password Change, Address Book etc. */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">More Options</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Additional profile management features like changing password or managing addresses will be available here in the future.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
