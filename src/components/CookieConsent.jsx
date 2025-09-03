import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieCategory = ({ title, description, checked, onChange, disabled = false }) => (
  <div className="py-3 sm:py-4 border-b border-slate-200/80 last:border-b-0">
    <div className="flex items-center justify-between">
      <label htmlFor={title} className="font-semibold text-slate-800 pr-4">{title}</label>
      <div
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange()}
      >
        <input
          type="checkbox"
          id={title}
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
        />
        <span className={`inline-block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-slate-900' : 'bg-slate-300'}`}></span>
        <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></span>
      </div>
    </div>
    <p className="text-sm text-slate-600 mt-1">{description}</p>
  </div>
);

const CookieConsent = ({
  onAcceptAll = () => {},
  onRejectAll = () => {},
  onSavePreferences = () => {},
}) => {
  const [view, setView] = useState('banner'); // 'banner' or 'preferences'
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
  });

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSavePreferences({ essential: true, ...preferences });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="cookie-consent"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-white/80 backdrop-blur-lg shadow-t-lg p-5 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'banner' && (
                <motion.div
                  key="banner"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-700 text-center sm:text-left flex-1">
                      We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our{' '}
                      <Link to="/legal/cookie-policy" className="font-medium text-blue-600 hover:underline">
                        Cookie Policy
                      </Link>
                      .
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setView('preferences')} className="bg-slate-200/80 text-slate-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-300 transition-colors">
                        Manage
                      </button>
                      <button onClick={onRejectAll} className="bg-slate-200/80 text-slate-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-300 transition-colors">
                        Reject
                      </button>
                      <button onClick={onAcceptAll} className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                        Accept All
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-slate-800">
                    <h3 className="font-bold text-lg mb-2">Customize Your Cookie Preferences</h3>
                    <p className="text-sm text-slate-600 mb-4">You can control your cookie settings below. Essential cookies cannot be disabled.</p>
                    
                    <div>
                      <CookieCategory 
                        title="Strictly Necessary"
                        description="These cookies are essential for the website to function and cannot be switched off in our systems."
                        checked={true}
                        disabled={true}
                        onChange={() => {}}
                      />
                      <CookieCategory 
                        title="Analytics Cookies"
                        description="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site."
                        checked={preferences.analytics}
                        onChange={() => handlePreferenceChange('analytics')}
                      />
                      <CookieCategory 
                        title="Marketing Cookies"
                        description="These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites."
                        checked={preferences.marketing}
                        onChange={() => handlePreferenceChange('marketing')}
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-5">
                      <button onClick={handleSave} className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                        Save Preferences
                      </button>
                      <button onClick={onAcceptAll} className="bg-slate-200/80 text-slate-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-300 transition-colors">
                        Accept All
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
