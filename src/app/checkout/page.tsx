
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
import { ShoppingBag, CreditCard, Loader2, UserCircle, LogIn, UserPlus, Mail, MessageSquare } from "lucide-react";
import type { Order, CartItemType } from "@/lib/types";

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

function generateNextOrderId(): string {
  let lastOrderNumber = 0;
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
    // If error, we'll just start from 0, which means the next order sequence will be 1.
  }

  const nextOrderSequence = lastOrderNumber + 1;
  localStorage.setItem(LAST_ORDER_NUMBER_KEY, nextOrderSequence.toString());

  // Pad the number to 3 digits (e.g., 1 -> "001", 10 -> "010", 100 -> "100")
  const paddedNumber = nextOrderSequence.toString().padStart(3, '0');
  return `PSOID${paddedNumber}`;
}


export default function CheckoutPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, clearCart, loading: cartLoading, getItemCount } = useCart();
  const { toast } = useToast();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: currentUser?.name || "",
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
    if (currentUser && currentUser.name && !form.getValues("name")) {
      form.setValue("name", currentUser.name);
    }
  }, [currentUser, form]);


  const onSubmit = async (data: ShippingFormValues) => {
    if (!isAuthenticated || !currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to place your order.",
            variant: "destructive",
        });
        return;
    }
    setIsProcessingOrder(true);
    // Simulate API call for order processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderId = generateNextOrderId();

    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      items: cartItems.map(item => ({ ...item })), // Create a deep copy of cart items
      totalAmount: getCartTotal(),
      shippingAddress: data,
      createdAt: new Date(),
      status: 'Pending',
    };

    // Save order to localStorage
    const ordersStorageKey = `orders_${currentUser.id}`;
    const existingOrdersString = localStorage.getItem(ordersStorageKey);
    const existingOrders: Order[] = existingOrdersString ? JSON.parse(existingOrdersString) : [];
    localStorage.setItem(ordersStorageKey, JSON.stringify([newOrder, ...existingOrders]));

    console.log("Order placed with data:", newOrder);

    // Simulate sending notifications
    console.log(`%c[Notification Simulation]`, 'font-weight: bold; color: blue;');
    console.log(`TO OWNER (${OWNER_EMAIL}): New order placed! Order ID: ${newOrder.id}, Total: ₹${newOrder.totalAmount.toFixed(2)}`);
    console.log(`TO OWNER (SMS ${OWNER_PHONE}): New order! ID: ${newOrder.id}, Total: ₹${newOrder.totalAmount.toFixed(2)}`);
    console.log(`TO BUYER (${currentUser.email}): Your SecureView order ${newOrder.id} has been confirmed! Total: ₹${newOrder.totalAmount.toFixed(2)}`);


    toast({
      title: "Order Placed Successfully!",
      description: `Thank you for your purchase. Your order ID is ${newOrder.id}.`,
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
        {/* Shipping Details and Payment OR Login Prompt */}
        <div className="lg:col-span-2 space-y-8">
          {isAuthenticated ? (
            <>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Shipping Details</CardTitle>
                  <CardDescription>Enter your shipping address to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
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
                      {/* Form submission is handled by the button in the Order Summary */}
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" /> Payment Information
                  </CardTitle>
                  <CardDescription>{APP_NAME} uses a secure payment gateway.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-muted rounded-md text-center text-muted-foreground">
                    <p>Payment processing is currently simulated for this prototype.</p>
                    <p>In a real application, secure payment fields would appear here.</p>
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

        {/* Order Summary */}
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
                <span>Free</span> {/* Or calculate shipping */}
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
                disabled={isProcessingOrder || (isAuthenticated && !form.formState.isValid) || !isAuthenticated}
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


    