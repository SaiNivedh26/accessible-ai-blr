"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaSignLanguage, FaYoutube, FaFileAlt, FaMicrophone } from "react-icons/fa";

const features = [
  {
    icon: <FaYoutube className="w-8 h-8 text-red-500" />,
    title: "YouTube Video Processing",
    description: "Download and convert YouTube videos into sign language videos with accurate ISL syntax."
  },
  {
    icon: <FaFileAlt className="w-8 h-8 text-blue-500" />,
    title: "Local File Processing",
    description: "Convert local video or audio files into sign language videos that are accessible and comprehensive."
  },
  {
    icon: <FaSignLanguage className="w-8 h-8 text-green-500" />,
    title: "Text to Sign Language",
    description: "Translate text into ISL syntax and compile into coherent sign language videos."
  },
  {
    icon: <FaMicrophone className="w-8 h-8 text-purple-500" />,
    title: "Speech to Sign Language",
    description: "Convert spoken content into sign language using Google Cloud Speech-to-Text API."
  }
];

export function Features() {
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
            Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Comprehensive Accessibility Tools
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our sign language converter supports multiple input formats, ensuring maximum accessibility for the deaf and hard-of-hearing community.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 inline-block rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
