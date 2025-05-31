"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:ring-2 ring-blue-400 transition-all duration-300"
      whileTap={{ scale: 0.9 }}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        key={theme}
      >
        {theme === "light" ? (
          <FaSun className="text-yellow-500" size={18} />
        ) : (
          <FaMoon className="text-blue-400" size={18} />
        )}
      </motion.div>
    </motion.button>
  );
}
