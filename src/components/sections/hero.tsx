"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export function Hero() {
  const { user, isLoading } = useAuth();
  
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium mb-4">
              Accessible Communication
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Digital Content to <span className="text-blue-600 dark:text-blue-400">Sign Language</span> Converter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Breaking communication barriers by converting various forms of digital media into Indian Sign Language videos for the deaf and hard-of-hearing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isLoading ? (
                <div className="h-11 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md w-36"></div>
              ) : user ? (
                <Link href="/profile">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl">
              <Image 
                src="/images/hero-image.jpg"
                alt="Sign Language Conversion"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
    </section>
  );
}
