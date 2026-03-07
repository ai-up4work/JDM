'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                JDM
              </span>
            </h3>
            <p className="text-background/80 text-sm leading-relaxed">
              South Asia's largest fashion discovery platform connecting you with premium brands and sellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="hover:text-secondary transition-colors">
                  Sellers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-secondary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-secondary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-secondary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/women" className="hover:text-secondary transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/category/men" className="hover:text-secondary transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/category/kids" className="hover:text-secondary transition-colors">
                  Kids
                </Link>
              </li>
              <li>
                <Link href="/category/jewelry" className="hover:text-secondary transition-colors">
                  Jewelry
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background/20 border-background/40 text-background placeholder:text-background/60"
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-secondary" />
                <span>4 (0) 123-456789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-secondary" />
                <span>support@jdm.lk</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-secondary" />
                <span>Karachi, Pakistan</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Follow Us:</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary hover:text-foreground"
                >
                  <Facebook size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary hover:text-foreground"
                >
                  <Twitter size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary hover:text-foreground"
                >
                  <Instagram size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-background/70">
          <p>&copy; 2024 JDM. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
