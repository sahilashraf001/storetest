
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import type { Order, CartItemType } from "@/lib/types";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Loader2, AlertTriangle } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.title = order ? `Order ${order.id} | ${APP_NAME}` : `Order Details | ${APP_NAME}`;
  }, [order]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN + `?redirect=${ROUTES.ORDERS}/${orderId}`);
      return;
    }

    if (currentUser && orderId) {
      setIsLoadingOrder(true);
      setError(null);
      try {
        const ordersStorageKey = `orders_${currentUser.id}`;
        const storedOrdersString = localStorage.getItem(ordersStorageKey);
        if (storedOrdersString) {
          const parsedOrders: Order[] = JSON.parse(storedOrdersString);
          const foundOrder = parsedOrders.find(o => o.id === orderId);
          if (foundOrder) {
            setOrder({...foundOrder, createdAt: new Date(foundOrder.createdAt)});
          } else {
            setError("Order not found.");
          }
        } else {
          setError("No orders found for this user.");
        }
      } catch (e) {
        console.error("Failed to load order from localStorage:", e);
        setError("Failed to load order details.");
      } finally {
        setIsLoadingOrder(false);
      }
    } else if (!orderId){
        setError("Order ID is missing.");
        setIsLoadingOrder(false);
    }
  }, [currentUser, orderId, authLoading, isAuthenticated, router]);

  if (authLoading || (isAuthenticated && isLoadingOrder)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="w-20 h-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground mb-8">{error}</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.ORDERS}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    // Should be caught by error state, but as a fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Package className="w-20 h-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Order Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The order you are looking for could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.ORDERS}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Link>
        </Button>
      </div>
    );
  }

  const { shippingAddress } = order;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.ORDERS}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Order ID: <span className="font-normal text-muted-foreground">{order.id}</span></CardTitle>
          <CardDescription>
            Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Items Ordered</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden md:table-cell">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint={item["data-ai-hint"]}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="hidden md:table-cell"></TableCell>
                  <TableCell colSpan={3} className="md:col-span-1 text-right font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">₹{order.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
              <address className="not-italic text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{shippingAddress.name}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
              </address>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Status</h3>
              <p className={`font-semibold text-lg ${
                  order.status === 'Pending' ? 'text-yellow-600' :
                  order.status === 'Shipped' ? 'text-blue-600' :
                  order.status === 'Delivered' ? 'text-green-600' :
                  'text-red-600' // Cancelled
              }`}>
                {order.status}
              </p>
              {/* Could add status history or tracking info here */}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href={ROUTES.PRODUCTS}>Continue Shopping</Link>
            </Button>
            {/* Add reorder or contact support buttons if needed */}
        </CardFooter>
      </Card>
    </div>
  );
}

