import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide the loader after 2 seconds as requested by the user
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#080B16] overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#7C3AED]/10 dark:bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#6366F1]/10 dark:bg-[#7C3AED]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Loader Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Elegant Spinning Core */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-8 flex items-center justify-center">
              {/* Outer spinning glowing ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#A855F7] border-l-[#A855F7] animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
              {/* Inner pulsing core */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#A855F7]/20 to-transparent border border-[#A855F7]/30 animate-pulse backdrop-blur-md"></div>
              {/* Center dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_10px_#A855F7]"></div>
            </div>

            {/* Glowing Text */}
            <h2 className="text-2xl sm:text-3xl font-bangla font-bold text-[#A855F7] tracking-wider text-center px-4 animate-pulse drop-shadow-md">
              গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
