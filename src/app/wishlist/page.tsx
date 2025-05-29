
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Heart, ShoppingCart, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    document.title = `My Wishlist | ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace(ROUTES.LOGIN + `?redirect=${ROUTES.WISHLIST}`);
    }
  }, [currentUser, authLoading, router]);


  const handleAddToCart = (product: typeof wishlistItems[0]) => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: `${productName} has been removed from your wishlist.`,
    });
  };

  if (authLoading || wishlistLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }
  
  if (!isAuthenticated && !authLoading) {
    // This case should be handled by the redirect, but as a fallback:
   return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
       <Heart className="w-20 h-20 text-muted-foreground mb-6" />
       <h1 className="text-3xl font-bold text-primary mb-4">Please Login</h1>
       <p className="text-lg text-muted-foreground mb-8">
         You need to be logged in to view your wishlist.
       </p>
       <Button asChild size="lg">
         <Link href={ROUTES.LOGIN + `?redirect=${ROUTES.WISHLIST}`}>Login</Link>
       </Button>
     </div>
   );
 }


  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
        <Heart className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Your Wishlist is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Looks like you haven't added any products to your wishlist yet.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={ROUTES.PRODUCTS}>Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <Link href={ROUTES.PRODUCT_DETAIL(item.id)} className="block">
              <CardHeader className="p-0">
                <div className="aspect-[4/3] relative w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={item["data-ai-hint"]}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-1 truncate" title={item.name}>
                  {item.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground h-10 line-clamp-2">
                  {item.description}
                </CardDescription>
                <p className="text-lg font-bold text-primary mt-2">₹{item.price.toFixed(2)}</p>
              </CardContent>
            </Link>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
              <Button onClick={() => handleAddToCart(item)} className="w-full transition-transform hover:scale-105 active:scale-95">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <div className="flex gap-2 w-full">
                <Link href={ROUTES.PRODUCT_DETAIL(item.id)} passHref legacyBehavior className="flex-1">
                    <Button variant="outline" className="w-full transition-transform hover:scale-105 active:scale-95" aria-label={`View ${item.name} details`}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full flex-1 transition-transform hover:scale-105 active:scale-95 text-destructive hover:text-destructive/90 hover:border-destructive/90"
                  onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
