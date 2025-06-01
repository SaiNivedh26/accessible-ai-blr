"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Technologies() {
  const technologies = [
    { name: "Python", category: "Core" },
    { name: "React.js", category: "Frontend" },
    { name: "Google Cloud Speech-to-Text API", category: "Voice Processing" },
    { name: "MoviePy", category: "Video Processing" },
    { name: "Pydub", category: "Audio Processing" },
    { name: "NLTK", category: "NLP" },
    { name: "Stanford Parser", category: "Syntactic Parsing" },
    { name: "yt-dlp", category: "YouTube Download" },
    { name: "ffmpeg", category: "Media Processing" },
    { name: "Pinata", category: "Decentralized Storage" },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium mb-4"
          >
            Tech Stack
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Technologies Used
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our sign language converter is built using a blend of advanced technologies to ensure accuracy and efficiency.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 block">
                  {tech.category}
                </span>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {tech.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white dark:bg-transparent"
            >
              Learn More About Our Tech Stack
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
