
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { ShoppingBag, CreditCard, Loader2, UserCircle, LogIn, UserPlus, Mail, MessageSquare, UploadCloud, FileText, Banknote } from "lucide-react";
import type { Order, CartItemType, AddressType } from "@/lib/types";

const shippingSchema = z.object({
  name: z.string().min(2, { message: "Full name is required." }),
  address: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  postalCode: z.string().min(4, { message: "Postal code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const OWNER_EMAIL = "msprincesolutions@gmail.com";
const OWNER_PHONE = "9917122440";
const LAST_ORDER_NUMBER_KEY = 'last_secureview_order_number';
const GLOBAL_ORDERS_STORAGE_KEY = 'GLOBAL_ALL_ORDERS'; // Changed for global storage

// Bank Details for Manual Payment
const BANK_ACCOUNT_NAME = "PRINCE SOLUTIONS";
const BANK_ACCOUNT_NUMBER = "123456789012";
const BANK_IFSC_CODE = "BANK0000001";
const UPI_ID_FOR_QR_TEXT = "princesolutions@upi";

function generateNextOrderId(): string {
  let lastOrderNumber = 0;
  if (typeof window !== 'undefined') {
    try {
      const storedLastOrderNumber = localStorage.getItem(LAST_ORDER_NUMBER_KEY);
      if (storedLastOrderNumber) {
        const parsedNumber = parseInt(storedLastOrderNumber, 10);
        if (!isNaN(parsedNumber)) {
          lastOrderNumber = parsedNumber;
        }
      }
    } catch (e) {
      console.error("Error reading last order number from localStorage", e);
    }
  }

  const nextOrderSequence = lastOrderNumber + 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ORDER_NUMBER_KEY, nextOrderSequence.toString());
  }
  const paddedNumber = nextOrderSequence.toString().padStart(3, '0');
  return `PSOID${paddedNumber}`;
}


export default function CheckoutPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, clearCart, loading: cartLoading, getItemCount } = useCart();
  const { toast } = useToast();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');


  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    document.title = `Checkout | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        const defaultAddress = currentUser.addresses.find(addr => addr.isDefault) || currentUser.addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          form.reset({
            name: currentUser.name || "", 
            address: defaultAddress.street,
            city: defaultAddress.city,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
          });
        }
      } else {
        setSelectedAddressId('new');
        form.setValue("name", currentUser.name || "");
      }
    } else {
       form.reset({ name: "", address: "", city: "", postalCode: "", country: "" });
    }
  }, [currentUser, form]);
  
  const handleAddressSelectionChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      form.reset({
        name: currentUser?.name || "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
      });
    } else if (currentUser?.addresses) {
      const selectedAddr = currentUser.addresses.find(addr => addr.id === addressId);
      if (selectedAddr) {
        form.reset({
          name: currentUser.name || "", 
          address: selectedAddr.street,
          city: selectedAddr.city,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
        });
      }
    }
  };


  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast({
            title: "File Too Large",
            description: "Payment receipt file should be less than 5MB.",
            variant: "destructive",
        });
        setPaymentReceiptFile(null);
        event.target.value = ""; 
        return;
      }
      setPaymentReceiptFile(file);
    } else {
      setPaymentReceiptFile(null);
    }
  };

  const onSubmit = async (data: ShippingFormValues) => {
    if (!isAuthenticated || !currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to place your order.",
            variant: "destructive",
        });
        return;
    }
    if (!paymentReceiptFile) {
        toast({
            title: "Payment Receipt Required",
            description: "Please upload your payment receipt to proceed.",
            variant: "destructive",
        });
        return;
    }

    setIsProcessingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const orderId = generateNextOrderId();

    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      userName: currentUser.name, // Store user's name
      userEmail: currentUser.email, // Store user's email
      items: cartItems.map(item => ({ ...item })),
      totalAmount: getCartTotal(),
      shippingAddress: { 
        name: data.name, 
        address: data.address, 
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      },
      createdAt: new Date(),
      status: 'Awaiting Payment Confirmation',
      paymentReceiptFilename: paymentReceiptFile.name,
    };

    let existingOrders: Order[] = [];
    if (typeof window !== 'undefined') {
        const existingOrdersString = localStorage.getItem(GLOBAL_ORDERS_STORAGE_KEY);
        existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : [];
        localStorage.setItem(GLOBAL_ORDERS_STORAGE_KEY, JSON.stringify([newOrder, ...existingOrders]));
    }


    console.log("Order placed with data:", newOrder);
    console.log(`%c[Notification Simulation]`, 'font-weight: bold; color: blue;');
    console.log(`TO OWNER (${OWNER_EMAIL}): New order ${newOrder.id} awaiting payment confirmation. Receipt: ${newOrder.paymentReceiptFilename}. Total: ₹${newOrder.totalAmount.toFixed(2)}`);
    console.log(`TO OWNER (SMS ${OWNER_PHONE}): New order ${newOrder.id} awaiting payment confirmation. Receipt: ${newOrder.paymentReceiptFilename}. Total: ₹${newOrder.totalAmount.toFixed(2)}`);
    console.log(`TO BUYER (${currentUser.email}): Your ${APP_NAME} order ${newOrder.id} is awaiting payment confirmation. Total: ₹${newOrder.totalAmount.toFixed(2)}`);

    toast({
      title: "Order Received!",
      description: `Your order ID is ${newOrder.id}. It's awaiting payment confirmation. We'll notify you once verified.`,
      duration: 7000,
      action: (
        <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Order ID: {newOrder.id}</p>
            <Link href={ROUTES.ORDERS + `/${newOrder.id}`}>
                <Button variant="outline" size="sm">View Order</Button>
            </Link>
        </div>
      )
    });

    clearCart();
    setIsProcessingOrder(false);
    router.push(`${ROUTES.ORDERS}/${newOrder.id}`); 
  };

  if (authLoading || cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to add items to your cart before you can checkout.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={ROUTES.PRODUCTS}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {isAuthenticated && currentUser ? (
            <>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Shipping Details</CardTitle>
                   {currentUser.addresses && currentUser.addresses.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label>Select Shipping Address</Label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelectionChange(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background text-sm"
                      >
                        {currentUser.addresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.name} - {addr.street}, {addr.city}
                          </option>
                        ))}
                        <option value="new">--- Enter New Address ---</option>
                      </select>
                    </div>
                  )}
                  {selectedAddressId === 'new' && <CardDescription className="pt-2">Enter your shipping address to continue.</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Recipient)</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
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
                          control={form.control}
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
                         <FormField
                          control={form.control}
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
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" /> Payment Information
                  </CardTitle>
                  <CardDescription>Complete payment using one of the methods below and upload your receipt.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                      <h4 className="font-semibold text-lg flex items-center gap-2"><Banknote className="h-5 w-5 text-primary"/>Bank Transfer</h4>
                      <p className="text-sm"><span className="font-medium">Account Name:</span> {BANK_ACCOUNT_NAME}</p>
                      <p className="text-sm"><span className="font-medium">Account Number:</span> {BANK_ACCOUNT_NUMBER}</p>
                      <p className="text-sm"><span className="font-medium">IFSC Code:</span> {BANK_IFSC_CODE}</p>
                      <p className="text-sm"><span className="font-medium">Bank Name:</span> Your Bank Name</p>
                    </div>
                    <div className="space-y-3 p-4 border rounded-md bg-muted/30 flex flex-col items-center">
                      <h4 className="font-semibold text-lg">UPI / QR Code</h4>
                       <Image
                          src="https://placehold.co/200x200.png?text=Scan+UPI+QR"
                          alt="UPI QR Code"
                          width={150}
                          height={150}
                          className="rounded-md border"
                          data-ai-hint="qr code"
                        />
                      <p className="text-sm text-center"><span className="font-medium">UPI ID:</span> {UPI_ID_FOR_QR_TEXT}</p>
                    </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <Label htmlFor="paymentReceipt" className="text-base font-medium flex items-center gap-2 mb-2">
                      <UploadCloud className="h-5 w-5 text-primary" /> Upload Payment Receipt
                    </Label>
                    <Input
                      id="paymentReceipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleReceiptUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {paymentReceiptFile && (
                      <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-green-600" /> Selected: {paymentReceiptFile.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB. Allowed types: JPG, PNG, PDF.</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserCircle className="h-7 w-7 text-primary" /> Login or Sign Up to Continue
                </CardTitle>
                <CardDescription>
                  You need an account to provide shipping details and place your order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">
                    By logging in or creating an account, you can save your shipping details for faster checkout in the future.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button asChild size="lg" className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={`${ROUTES.LOGIN}?redirect=${ROUTES.CHECKOUT}`}>
                        <LogIn className="mr-2 h-5 w-5" /> Login
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
                      <Link href={`${ROUTES.SIGNUP}?redirect=${ROUTES.CHECKOUT}`}>
                        <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                      </Link>
                    </Button>
                  </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
              <CardDescription>{getItemCount()} item(s) in your cart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint={item["data-ai-hint"]}
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button" 
                onClick={form.handleSubmit(onSubmit)} 
                className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={
                  isProcessingOrder || 
                  !isAuthenticated || 
                  !form.formState.isValid || 
                  !paymentReceiptFile 
                }
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Place Order & Confirm Payment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
