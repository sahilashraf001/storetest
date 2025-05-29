
"use client";

import React from "react";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com", // Replace with actual link
    ariaLabel: `Follow ${APP_NAME} on Facebook`,
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com", // Replace with actual link
    ariaLabel: `Follow ${APP_NAME} on Twitter`,
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com", // Replace with actual link
    ariaLabel: `Follow ${APP_NAME} on Instagram`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com", // Replace with actual link
    ariaLabel: `Follow ${APP_NAME} on LinkedIn`,
  },
];

export function ContactInfoSection() {
  return (
    <section className="bg-card border-t border-b py-10 md:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Address */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary flex items-center justify-center md:justify-start">
            <MapPin className="mr-2 h-6 w-6" /> Our Address
          </h3>
          <address className="not-italic text-muted-foreground space-y-1">
            <p>{APP_NAME} Solutions</p>
            <p>123 Security Lane, Tech Park</p>
            <p>New Delhi, 110001</p>
            <p>India</p>
          </address>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary flex items-center justify-center md:justify-start">
            <Mail className="mr-2 h-6 w-6" /> Contact Us
          </h3>
          <div className="text-muted-foreground space-y-1">
            <p>
              Email:{" "}
              <a
                href="mailto:sales@secureview.com"
                className="hover:text-primary hover:underline"
              >
                sales@secureview.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+919917122440"
                className="hover:text-primary hover:underline"
              >
                +91 9917122440
              </a>
            </p>
            {/* You can add business hours here if needed */}
            <p>Mon - Fri: 9:00 AM - 6:00 PM IST</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary flex items-center justify-center md:justify-start">
            <UsersIcon className="mr-2 h-6 w-6" /> Follow Us {/* Using a generic icon as UsersIcon is not directly imported */}
          </h3>
          <div className="flex justify-center md:justify-start space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <social.icon className="h-6 w-6" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Stay connected for the latest updates and offers.</p>
        </div>
      </div>
    </section>
  );
}

// Helper Icon as UsersIcon is not available in lucide-react directly like that
// Fallback to a generic group icon or use an appropriate one
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
