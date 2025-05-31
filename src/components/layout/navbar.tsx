"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import UserProfileWidget from "@/components/auth/user-profile-widget";
import Link from "next/link";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publicLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#technologies", label: "Technologies" },
    { href: "#contact", label: "Contact" },
    { href: "https://github.com/SaiNivedh26/accessible-ai-blr", label: "GitHub" },
  ];

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/convert", label: "Convert" },
    { href: "/development", label: "What's New" },
    { href: "/history", label: "History" },
  ];

  const navLinks = user ? authenticatedLinks : publicLinks;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">SL</span>
            Extension
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-6">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isLoading ? (
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
              ) : user ? (
                <UserProfileWidget />
              ) : (
                <Link href="/login">
                  <Button size="md">Get Started</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <ul className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="block py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300">Toggle theme</span>
                  <ThemeToggle />
                </div>
                {isLoading ? (
                  <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                ) : user ? (
                  <div className="space-y-2">
                    <Link href="/profile" className="w-full">
                      <Button size="md" variant="outline" className="w-full flex items-center justify-center gap-2">
                        <FaUserCircle />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => signOut()} 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button className="w-full" size="md">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
