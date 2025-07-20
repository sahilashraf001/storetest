
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getProductById, getProducts } from "@/lib/products"; // getProducts added
import type { Product } from "@/lib/types";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { recommendProducts } from "@/ai/flows/product-recommendation"; // Import the AI flow

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductList } from "@/components/products/ProductList";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useViewingHistory } from "@/hooks/useViewingHistory";

import {
  ShoppingCart,
  Heart,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ListChecks,
  Tag,
  Info,
  Package,
  ChevronLeft,
  Sparkles, // For AI recommendations section
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const { addToHistory, viewingHistory } = useViewingHistory(); // Get viewingHistory

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      const fetchedProduct = getProductById(productId);
      setProduct(fetchedProduct);
      setIsLoading(false);
      if (fetchedProduct) {
        document.title = `${fetchedProduct.name} | ${APP_NAME}`;
        addToHistory(fetchedProduct.id);
      } else {
        document.title = `Product Not Found | ${APP_NAME}`;
      }
    }
  }, [productId, addToHistory]);

  useEffect(() => {
    if (product && product.id) {
      const fetchRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
          const allOtherProductIds = getProducts()
            .map(p => p.id)
            .filter(id => id !== product.id);

          if (allOtherProductIds.length === 0) {
            setRecommendedProducts([]);
            setIsLoadingRecommendations(false);
            return;
          }

          const recommendationsOutput = await recommendProducts({
            currentProductId: product.id,
            currentProductName: product.name,
            currentProductCategory: product.category,
            viewingHistory: viewingHistory,
            availableProductIds: allOtherProductIds,
            maxRecommendations: 4,
          });
          
          if (recommendationsOutput.productRecommendations && recommendationsOutput.productRecommendations.length > 0) {
            const fetchedRecommendedProducts = recommendationsOutput.productRecommendations
              .map(id => getProductById(id))
              .filter((p): p is Product => p !== undefined); // Type guard to filter out undefined
            setRecommendedProducts(fetchedRecommendedProducts);
          } else {
            setRecommendedProducts([]);
          }
        } catch (error) {
          console.error("Failed to fetch product recommendations:", error);
          setRecommendedProducts([]); // Clear on error
        } finally {
          setIsLoadingRecommendations(false);
        }
      };
      fetchRecommendations();
    }
  }, [product, viewingHistory]);


  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
        action: <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.LOGIN + `?redirect=${ROUTES.PRODUCT_DETAIL(productId)}`)}>Login</Button>
      });
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

  const productInWishlist = useMemo(() => product ? isProductInWishlist(product.id) : false, [product, isProductInWishlist]);

  // No longer using getRelatedProducts, using AI recommendations instead
  // const relatedProducts = useMemo(() => {
  //   if (!product) return [];
  //   return getRelatedProducts(product.id, product.category, 4);
  // }, [product]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (product === null) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4">
        <AlertTriangle className="w-20 h-20 text-destructive mb-6" />
        <h1 className="text-4xl font-bold text-primary mb-4">Product Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the product you're looking for. It might have been removed or the link is incorrect.
        </p>
        <Button asChild size="lg">
          <Link href={ROUTES.PRODUCTS} className="flex items-center">
            <ChevronLeft className="mr-2 h-5 w-5" /> Go Back to Products
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!product) {
      return notFound();
  }


  return (
    <div className="space-y-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl overflow-hidden">
          <div className="aspect-[4/3] relative w-full bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              className="object-cover"
              priority
              data-ai-hint={product["data-ai-hint"] || "product image"}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0 ml-4"
                    aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                    <Heart className={`h-6 w-6 ${productInWishlist && currentUser ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              </div>
              <CardDescription className="text-lg text-muted-foreground flex items-center gap-2 pt-1">
                <Tag className="h-5 w-5" /> {product.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold text-accent">₹{product.price.toFixed(2)}</p>

              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                {product.stock > 0 ? (
                  <span className={`font-medium ${product.stock < 5 ? 'text-destructive' : 'text-green-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                    {product.stock > 0 && product.stock < 5 && " (Few left!)"}
                  </span>
                ) : (
                   <span className="font-medium text-destructive">Out of Stock</span>
                )}
              </div>
              
              <Separator />

              <div className="space-y-2">
                <h3 className="text-md font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>

              {product.features && product.features.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Features</h3>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                        {product.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
              
              <Separator />
              
              <Button 
                size="lg" 
                onClick={handleAddToCart} 
                className="w-full text-lg py-6 mt-4"
                disabled={product.stock === 0}
                aria-label={product.stock === 0 ? "Out of stock" : "Add to cart"}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended Products Section */}
      {(isLoadingRecommendations || recommendedProducts.length > 0) && (
        <section className="mt-16 pt-10 border-t">
          <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            You Might Also Like
          </h2>
          {isLoadingRecommendations ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card p-4 rounded-lg shadow animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-1"></div>
                  <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : recommendedProducts.length > 0 ? (
            <ProductList products={recommendedProducts} />
          ) : null}
        </section>
      )}
    </div>
  );
}
