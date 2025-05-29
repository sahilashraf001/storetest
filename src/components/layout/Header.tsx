
"use client";

import Link from "next/link";
import { Shield, ShoppingCart, Heart, User, LogIn, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
    {children}
  </Link>
);

export function Header() {
  const { getItemCount } = useCart();
  const { currentUser, logout, loading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const navItems = [
    { href: ROUTES.HOME, label: "Home" },
    { href: ROUTES.PRODUCTS, label: "Products" },
  ];

  const authenticatedNavItems = [
    { href: ROUTES.WISHLIST, label: "Wishlist" },
    { href: ROUTES.ORDERS, label: "My Orders" },
  ];
  
  const renderNavLinks = (isMobile = false) => (
    <>
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
      ))}
      {hasMounted && currentUser && authenticatedNavItems.map((item) => (
         <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
      ))}
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.CART} passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {hasMounted && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {getItemCount()}
                </span>
              )}
            </Button>
          </Link>

          {!authLoading && (
            currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User Menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hi, {currentUser.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.PROFILE}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.ORDERS}>My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={ROUTES.LOGIN} passHref>
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )
          )}
          {authLoading && <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <div className="p-6">
                  <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold text-primary">{APP_NAME}</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {renderNavLinks(true)}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
