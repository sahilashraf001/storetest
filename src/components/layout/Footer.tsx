
import { APP_NAME } from "@/lib/constants";
import React from "react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="mt-1">Your Trusted Partner in Security Solutions.</p>
      </div>
    </footer>
  );
}
