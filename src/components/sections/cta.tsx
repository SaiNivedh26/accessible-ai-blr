"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export function CTA() {
  const { user, isLoading } = useAuth();
  
  return (
    <section id="contact" className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                Ready to make your content accessible to everyone?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-lg text-blue-50 mb-8"
              >
                Join our community and start converting your digital content into sign language videos today.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="hidden lg:flex flex-col sm:flex-row gap-4 lg:justify-start"
              >
                {isLoading ? (
                  <div className="h-11 bg-gray-200 dark:bg-blue-700/50 animate-pulse rounded-md w-36"></div>
                ) : user ? (
                  <Link href="/profile">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      Get Started for Free
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-blue-700"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Get in Touch
              </h3>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
