import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieConsent = ({ onAccept }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-white/80 backdrop-blur-lg shadow-lg p-5 border-t border-slate-200/60">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                <p className="text-sm text-slate-700 text-center sm:text-left mb-4 sm:mb-0">
                    We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our{' '}
                    <Link to="/legal/cookie-policy" className="font-medium text-blue-600 hover:underline">
                    Cookie Policy
                    </Link>
                    .
                </p>
                <button
                    onClick={onAccept}
                    className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                    Accept Cookies
                </button>
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
