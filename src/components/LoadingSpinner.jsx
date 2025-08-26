import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: 1.5
        }}
        style={{ width: 80, height: 80 }}
      >
        <img src="/optimedix-logo.png" alt="Loading..." className="w-full h-full" />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
