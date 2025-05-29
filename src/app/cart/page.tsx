
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Trash2, PlusCircle, MinusCircle, ShoppingCart, ExternalLink } from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getItemCount,
    loading: cartLoading,
    clearCart,
  } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `Your Cart | ${APP_NAME}`;
  }, []);

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) { // Add check for stock limit if available in CartItemType
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast({
      title: "Item Removed",
      description: `${productName} has been removed from your cart.`,
    });
  };
  
  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  if (cartLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Loading Your Cart...</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24 h-24 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
          ))}
          <div className="h-10 bg-muted rounded w-1/3 ml-auto mt-4"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4">
        <ShoppingCart className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={ROUTES.PRODUCTS}>Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart ({getItemCount()} items)</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Remove</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cartItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="hidden md:table-cell">
                            <Link href={ROUTES.PRODUCT_DETAIL(item.id)}>
                                <Image
                                src={item.image}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded-md object-cover aspect-square"
                                data-ai-hint={item["data-ai-hint"]}
                                />
                            </Link>
                            </TableCell>
                            <TableCell>
                            <Link href={ROUTES.PRODUCT_DETAIL(item.id)} className="font-medium hover:text-primary transition-colors">
                                {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                            </TableCell>
                            <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                disabled={item.quantity <= 1}
                                >
                                <MinusCircle className="h-4 w-4" />
                                <span className="sr-only">Decrease quantity</span>
                                </Button>
                                <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value, 10);
                                    if (!isNaN(newQuantity) && newQuantity >= 1) {
                                    updateQuantity(item.id, newQuantity);
                                    }
                                }}
                                className="w-16 h-8 text-center px-1"
                                min="1"
                                // max={item.stock} // Consider adding max stock attribute
                                />
                                <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                // disabled={item.quantity >= item.stock} // Consider adding max stock attribute
                                >
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only">Increase quantity</span>
                                </Button>
                            </div>
                            </TableCell>
                            <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/80 h-8 w-8"
                                onClick={() => handleRemoveItem(item.id, item.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove item</span>
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="text-right">
                <Button variant="outline" onClick={handleClearCart} className="text-destructive hover:text-destructive/90 border-destructive hover:border-destructive/90">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
            </div>
        </div>
        
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <Card className="shadow-md sticky top-24"> {/* top-24 to account for sticky header */}
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({getItemCount()} items)</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span> {/* Or calculate shipping */}
              </div>
              {/* Add discount/coupon code input here if needed */}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full text-lg py-6">
                <Link href={ROUTES.CHECKOUT}>
                  Proceed to Checkout <ExternalLink className="ml-2 h-5 w-5"/>
                </Link>
              </Button>
               <Button variant="outline" asChild className="w-full">
                <Link href={ROUTES.PRODUCTS}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

