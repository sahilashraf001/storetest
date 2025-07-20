
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderStatus } from "@/lib/types";
import { ALL_ORDER_STATUSES } from "@/lib/types";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PackageSearch, Eye, FileText, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";

const GLOBAL_ORDERS_STORAGE_KEY = "GLOBAL_ALL_ORDERS";

export default function AdminOrdersPage() {
  const { currentUser } = useAuth(); // Layout already handles non-admin access
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");

  const { toast } = useToast();

  useEffect(() => {
    document.title = `Admin: All Orders | ${APP_NAME}`;
  }, []);

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    try {
      const storedOrdersString = localStorage.getItem(GLOBAL_ORDERS_STORAGE_KEY);
      if (storedOrdersString) {
        const parsedOrders: Order[] = JSON.parse(storedOrdersString);
        setAllOrders(parsedOrders.map(order => ({ ...order, createdAt: new Date(order.createdAt) })).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        setAllOrders([]);
      }
    } catch (error) {
      console.error("Failed to load orders from localStorage:", error);
      setAllOrders([]);
      toast({ variant: "destructive", title: "Error", description: "Could not load orders."});
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status); // Pre-fill with current status
    setIsStatusUpdateDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;

    const updatedOrders = allOrders.map(order =>
      order.id === selectedOrder.id ? { ...order, status: newStatus as OrderStatus } : order
    );
    localStorage.setItem(GLOBAL_ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    setAllOrders(updatedOrders.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())); // Re-sort after update
    setIsStatusUpdateDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus("");
    toast({ title: "Status Updated", description: `Order ${selectedOrder.id} status changed to ${newStatus}.` });
    // Simulate notification to buyer about status change
    console.log(`%c[Admin Notification Simulation]`, 'font-weight: bold; color: green;');
    console.log(`TO BUYER (${selectedOrder.userEmail || 'N/A'}): Your ${APP_NAME} order ${selectedOrder.id} status has been updated to: ${newStatus}.`);
  };
  
  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case 'Awaiting Payment Confirmation': return 'bg-amber-100 text-amber-700';
      case 'Confirmed': return 'bg-sky-100 text-sky-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading all orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin - All Orders ({allOrders.length})</h1>
         <Button onClick={fetchOrders} variant="outline">Refresh Orders</Button>
      </div>

      {allOrders.length === 0 ? (
        <Card className="shadow-md">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <PackageSearch className="w-24 h-24 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold text-primary mb-2">No Orders Found</h2>
                <p className="text-muted-foreground">There are currently no orders in the system.</p>
            </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate max-w-[120px]">{order.id}</TableCell>
                    <TableCell>
                        <div>{order.userName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{order.userEmail || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                        {order.paymentReceiptFilename ? (
                             <span className="flex items-center gap-1.5 text-xs text-muted-foreground" title={order.paymentReceiptFilename}>
                                <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0"/> 
                                <span className="truncate">{order.paymentReceiptFilename}</span>
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground/70 italic">None</span>
                        )}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Order Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details: {order.id}</DialogTitle>
                              <DialogDescription>
                                Customer: {order.userName} ({order.userEmail}) | Placed: {new Date(order.createdAt).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Items:</h4>
                                    <ul className="space-y-2">
                                    {order.items.map(item => (
                                        <li key={item.id} className="flex items-center gap-3 p-2 border rounded-md">
                                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded object-cover aspect-square" data-ai-hint={item["data-ai-hint"]}/>
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <p className="text-sm font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-1">Shipping Address:</h4>
                                        <address className="text-sm not-italic text-muted-foreground">
                                            <p>{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                            <p>{order.shippingAddress.country}</p>
                                        </address>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Payment:</h4>
                                        <p className="text-sm"><span className="font-medium">Total:</span> ₹{order.totalAmount.toFixed(2)}</p>
                                        <p className="text-sm"><span className="font-medium">Status:</span> <span className={`font-semibold ${getStatusColorClass(order.status).replace('bg-', 'text-')}`}>{order.status}</span></p>
                                        {order.paymentReceiptFilename && <p className="text-sm flex items-center gap-1"><FileText className="h-3.5 w-3.5"/>{order.paymentReceiptFilename}</p>}
                                    </div>
                                </div>
                            </div>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Close</Button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>

                      <Button variant="outline" size="icon" className="h-8 w-8" title="Update Status" onClick={() => handleOpenStatusDialog(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedOrder && (
        <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Status for Order: {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Current status: <span className={`font-semibold ${getStatusColorClass(selectedOrder.status).replace('bg-', 'text-')}`}>{selectedOrder.status}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <label htmlFor="status-select" className="text-sm font-medium">New Status:</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                       <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColorClass(status)}`}>
                         {status}
                       </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || newStatus === selectedOrder.status}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
