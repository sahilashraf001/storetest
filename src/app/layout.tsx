
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed from Geist to Inter as per typical sans-serif choice
import "./globals.css";
import { AppProviders } from "@/components/layout/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactInfoSection } from "@/components/layout/ContactInfoSection"; // Import the new section
import { APP_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Using Inter as the sans-serif font
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Your trusted partner in CCTV security solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning // Added to address hydration mismatch on body attributes
      >
        <AppProviders>
          <Header />
          <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            {children}
          </main>
          <ContactInfoSection /> {/* Add the new section here */}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
