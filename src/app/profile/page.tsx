
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/hooks/useAuth"; // Corrected import path
import type { AddressType } from "@/lib/types";
import { APP_NAME, ROUTES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Phone, Edit3, KeyRound, BookUser, PlusCircle, Trash2, Home, Briefcase, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


// Zod Schemas
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const addressSchema = z.object({
  name: z.string().min(2, "Label/Name is required (e.g., Home, Work)."),
  street: z.string().min(3, "Street address is required."),
  city: z.string().min(2, "City is required."),
  postalCode: z.string().min(4, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
});
type AddressFormValues = z.infer<typeof addressSchema>;


export default function ProfilePage() {
  const { currentUser, loading: authLoading, logout, isAuthenticated, checkPassword, addAddress, removeAddress } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: "", street: "", city: "", postalCode: "", country: "" },
  });

  useEffect(() => {
    document.title = `My Profile | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace(ROUTES.LOGIN + `?redirect=${ROUTES.PROFILE}`);
    }
  }, [currentUser, authLoading, router, isAuthenticated]);

  const handlePasswordChangeSubmit = async (data: PasswordChangeFormValues) => {
    if (!currentUser) return;
    
    // Simulate checking current password
    const isCurrentPasswordCorrect = await checkPassword(data.currentPassword);

    if (!isCurrentPasswordCorrect) {
      passwordForm.setError("currentPassword", { type: "manual", message: "Incorrect current password." });
      return;
    }
    // In a real app, you'd send this to a backend to securely change the password.
    // For this prototype, we just show a success message.
    console.log("Simulated password change for user:", currentUser.email, "New password:", data.newPassword);
    toast({
      title: "Password Changed (Simulated)",
      description: "Your password change has been simulated successfully.",
    });
    passwordForm.reset();
    setIsPasswordDialogOpen(false);
  };

  const handleAddAddressSubmit = async (data: AddressFormValues) => {
    const success = await addAddress(data);
    if (success) {
      toast({
        title: "Address Added",
        description: `The address "${data.name}" has been added.`,
      });
      addressForm.reset();
      setIsAddressDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Could not add address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAddress = async (addressId: string, addressName: string) => {
    const success = await removeAddress(addressId);
    if (success) {
      toast({
        title: "Address Removed",
        description: `The address "${addressName}" has been removed.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Could not remove address. Please try again.",
        variant: "destructive",
      });
    }
  };


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

      {/* Account Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>View your personal details.</CardDescription>
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
          {/* Edit Profile Button (Still simulated for non-password fields) */}
          {/* <div className="pt-2">
            <Button variant="secondary" disabled>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
            </Button>
          </div> */}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                  Update your password regularly to keep your account secure.
              </p>
          </div>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Edit3 className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and a new password.
                  <br/><span className="text-xs text-destructive font-medium">(This is a simulated password change for prototype purposes only)</span>
                </DialogDescription>
              </DialogHeader>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChangeSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Address Book */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookUser className="h-6 w-6 text-primary" />
            Address Book
          </CardTitle>
          <CardDescription>Manage your saved shipping addresses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentUser.addresses && currentUser.addresses.length > 0 ? (
            <ul className="space-y-4">
              {currentUser.addresses.map((addr) => (
                <li key={addr.id} className="p-4 border rounded-md flex justify-between items-start gap-4 bg-muted/20">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {addr.name.toLowerCase().includes("home") && <Home className="h-5 w-5 text-primary" />}
                      {addr.name.toLowerCase().includes("work") || addr.name.toLowerCase().includes("office") && <Briefcase className="h-5 w-5 text-primary" />}
                      <p className="font-semibold">{addr.name}</p>
                      {addr.isDefault && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Default</span>}
                    </div>
                    <address className="text-sm text-muted-foreground not-italic">
                      {addr.street}<br />
                      {addr.city}, {addr.postalCode}<br />
                      {addr.country}
                    </address>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    {/* Edit Address Button (Coming Soon) */}
                    {/* <Button variant="ghost" size="icon" className="h-8 w-8" disabled><Edit3 className="h-4 w-4" /></Button> */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Address?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove the address "{addr.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveAddress(addr.id, addr.name)} className="bg-destructive hover:bg-destructive/90">
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 border rounded-md bg-muted/30 text-center">
              <p className="text-muted-foreground">You have no saved addresses.</p>
            </div>
          )}
          
          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Enter the details for your new shipping address.
                </DialogDescription>
              </DialogHeader>
              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(handleAddAddressSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={addressForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Label / Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Home, Work Office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addressForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Apt 4B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addressForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={addressForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                     </DialogClose>
                    <Button type="submit" disabled={addressForm.formState.isSubmitting}>
                       {addressForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Address
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
