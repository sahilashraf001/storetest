
"use client";

import React from "react";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Users } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61564082030508", // Specific Facebook profile
    ariaLabel: `Follow ${APP_NAME} on Facebook`,
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/prince.solutions/#", // Placeholder, replace with actual link
    ariaLabel: `Follow ${APP_NAME} on Instagram`,
  },
  // {
  //   name: "LinkedIn",
  //   icon: Linkedin,
  //   href: "https://linkedin.com", // Placeholder, replace with actual link
  //   ariaLabel: `Follow ${APP_NAME} on LinkedIn`,
  // },
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
            <p>{APP_NAME}</p>
            <p>Super Market Near PNB</p>
            <p>Gajraula (Amroha) 244235</p>
            <p>Uttar Pradesh</p>
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
                href="mailto:msprincesolutions@gmail.com"
                className="hover:text-primary hover:underline"
              >
                msprincesolutions@gmail.com
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
            <p>Mon - Sun: 9:30 AM - 7:00 PM IST</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary flex items-center justify-center md:justify-start">
            <Users className="mr-2 h-6 w-6" /> Follow Us
          </h3>
          <div className="flex justify-center md:justify-start space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href} // Correctly use the href from the socialLinks array
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
