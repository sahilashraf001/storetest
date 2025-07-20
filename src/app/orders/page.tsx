
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Order } from "@/lib/types";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingBag, ExternalLink, Loader2 } from "lucide-react";

const GLOBAL_ORDERS_STORAGE_KEY = 'GLOBAL_ALL_ORDERS';

export default function OrdersPage() {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const router = useRouter();

  useEffect(() => {
    document.title = `My Orders | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (authLoading) return; 

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN + `?redirect=${ROUTES.ORDERS}`);
      return;
    }

    if (currentUser) {
      setIsLoadingOrders(true);
      try {
        const storedOrdersString = localStorage.getItem(GLOBAL_ORDERS_STORAGE_KEY);
        if (storedOrdersString) {
          const allOrders: Order[] = JSON.parse(storedOrdersString);
          const userOrders = allOrders.filter(order => order.userId === currentUser.id);
          setOrders(userOrders.map(order => ({...order, createdAt: new Date(order.createdAt)})));
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to load orders from localStorage:", error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    }
  }, [currentUser, authLoading, isAuthenticated, router]);

  if (authLoading || (isAuthenticated && isLoadingOrders)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Please Login</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to view your orders.
        </p>
        <Button asChild size="lg">
          <Link href={ROUTES.LOGIN + `?redirect=${ROUTES.ORDERS}`}>Login</Link>
        </Button>
      </div>
    );
  }
  

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Package className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">No Orders Yet</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You haven't placed any orders. Start shopping to see them here!
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={ROUTES.PRODUCTS}>Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
      <Card className="shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium truncate max-w-xs">
                    <Link href={`/orders/${order.id}`} className="hover:text-primary hover:underline">
                        {order.id}
                    </Link>
                    </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Awaiting Payment Confirmation' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'Confirmed' ? 'bg-sky-100 text-sky-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700' // Cancelled
                    }`}>
                        {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        View Order <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
