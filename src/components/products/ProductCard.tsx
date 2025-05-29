
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if card is wrapped in Link
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      router.push(ROUTES.LOGIN);
      return;
    }
    if (isProductInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };
  
  const productInWishlist = isProductInWishlist(product.id);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="block">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={product["data-ai-hint"]}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>
            {product.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground h-10 line-clamp-2">
            {product.description}
          </CardDescription>
          <p className="text-lg font-bold text-primary mt-2">₹{product.price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <Button onClick={handleAddToCart} className="w-full sm:w-auto flex-grow transition-transform hover:scale-105 active:scale-95" aria-label={`Add ${product.name} to cart`}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
        <div className="flex gap-2">
        <Link href={ROUTES.PRODUCT_DETAIL(product.id)} passHref legacyBehavior>
            <Button variant="outline" size="icon" className="transition-transform hover:scale-105 active:scale-95 flex-shrink-0" aria-label={`View ${product.name} details`}>
                <Eye className="h-4 w-4" />
            </Button>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleWishlist}
          className="transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label={productInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`h-4 w-4 ${productInWishlist && currentUser ? "fill-destructive text-destructive" : ""}`} />
        </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
