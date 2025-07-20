
"use client";

import { ProductList } from "@/components/products/ProductList";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES, APP_NAME } from "@/lib/constants";
import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES_SELECT_VALUE__";

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // "" means all categories
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAllProducts(getProducts());
    setIsLoading(false);
  }, []);

  const categories = useMemo(() => {
    if (isLoading) return [];
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category))).sort();
    return uniqueCategories;
  }, [allProducts, isLoading]);

  const filteredProducts = useMemo(() => {
    if (isLoading) return [];
    let products = [...allProducts];

    if (searchTerm) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) { // This is true if selectedCategory is not ""
      products = products.filter(product => product.category === selectedCategory);
    }

    return products;
  }, [allProducts, searchTerm, selectedCategory, isLoading]);

  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-card rounded-lg shadow">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your Trusted Partner for Advanced CCTV Security Solutions.
        </p>
         {/* Button removed as per previous request to show all products */}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center sm:text-left">Our Products</h2>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:flex-grow">
            <Label htmlFor="search-home-products" className="sr-only">Search Products</Label>
            <Input
              id="search-home-products"
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Label htmlFor="category-home-filter" className="sr-only">Filter by Category</Label>
            <Select
              value={selectedCategory || undefined} // Use undefined for placeholder when selectedCategory is ""
              onValueChange={(value) => {
                setSelectedCategory(value === ALL_CATEGORIES_OPTION_VALUE ? "" : value || "");
              }}
            >
              <SelectTrigger id="category-home-filter" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_OPTION_VALUE}>All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-card p-4 rounded-lg shadow animate-pulse">
               <div className="aspect-[4/3] bg-muted rounded mb-4"></div>
               <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
               <div className="h-4 bg-muted rounded w-full mb-1"></div>
               <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
               <div className="h-6 bg-muted rounded w-1/3"></div>
             </div>
           ))}
         </div>
        ) : (
          <ProductList products={filteredProducts} />
        )}
      </section>
    </div>
  );
}
