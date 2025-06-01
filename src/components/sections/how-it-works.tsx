"use client";

import React from "react";
import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Input your content",
      description: "Upload a YouTube URL, local video/audio file, or enter text that you want to convert into sign language."
    },
    {
      number: "02",
      title: "Automated processing",
      description: "Our system processes the input using advanced AI algorithms and Google Cloud Speech-to-Text API."
    },
    {
      number: "03",
      title: "Translation to ISL",
      description: "The content is translated into Indian Sign Language syntax using natural language processing."
    },
    {
      number: "04",
      title: "Video compilation",
      description: "Sign language videos are compiled using appropriate video clips and GIFs for coherent communication."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium mb-4"
          >
            Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our streamlined process makes it easy to convert any digital content into accessible sign language videos.
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-blue-100 dark:bg-blue-900/30 -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="lg:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {step.number}
                    </div>
                    <div className="hidden lg:block absolute top-1/2 w-8 h-1 bg-blue-100 dark:bg-blue-900/30 -translate-y-1/2 
                      ${index % 2 === 1 ? 'right-full' : 'left-full'}"></div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
