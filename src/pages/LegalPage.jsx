import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const legalSections = {
  'terms-of-service': {
    title: 'Terms of Service',
    content: () => (
      <div className="prose prose-lg text-gray-700 mx-auto">
        <p className="mb-4">This Telemedicine Services Agreement ("Agreement") is made between Optimedix Solutions Ltd. ("Optimedix") and the licensed medical practitioner ("Doctor") using this platform.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Services and Doctor’s Covenants</h2>
        <p>The Doctor agrees to provide professional, timely, and competent medical consultation services to patients via the Optimedix telemedicine platform (the “Platform”). The Doctor covenants and warrants that they shall:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Service Limitations:</strong> Acknowledge and agree that the Platform is intended for non-emergency medical consultations only...</li>
          <li><strong>Professional Standing & Licensure:</strong> Maintain a valid, unrestricted license to practice medicine...</li>
          <li><strong>Professional Liability Insurance:</strong> Obtain and maintain, at their own expense, a professional liability (malpractice) insurance policy...</li>
        </ul>
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Independent Contractor Status</h2>
        <p>It is expressly understood that the Doctor is an independent contractor and not an employee, agent, or partner of Optimedix...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Compensation & Payment</h2>
        <p>Details regarding consultation fees, commission, and payment schedules are outlined in the agreement...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Commission Rate Adjustment</h2>
        <p>Optimedix reserves the right to review and adjust the commission rate with prior written notice...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Confidentiality and Data Security</h2>
        <p>Both parties agree to maintain the strict confidentiality of all patient information and proprietary business information...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">6. Liability and Indemnification</h2>
        <p>The Doctor shall indemnify Optimedix from claims arising from their provision of medical services. Optimedix shall indemnify the Doctor from claims arising from a gross technical failure of the Platform...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">7. Term and Termination</h2>
        <p>This Agreement can be terminated by either party with thirty (30) days' written notice. Immediate termination clauses are also included...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">8. Dispute Resolution</h2>
        <p>Disputes shall first be attempted to be resolved through good faith negotiations, followed by mediation...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>
        <p>This Agreement shall be governed by the laws of the Republic of Ghana...</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">10. Entire Agreement</h2>
        <p>This Agreement constitutes the entire agreement between the parties...</p>
      </div>
    )
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: () => (
        <div className="prose prose-lg text-gray-700 mx-auto">
            <p className="mb-4">This Privacy Policy outlines how Optimedix Solutions Ltd. ("Optimedix") collects, uses, and protects your information when you use our telemedicine platform.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information necessary to provide our services, including personal identification, professional information, and patient information shared during consultations.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>Your information is used to facilitate consultations, verify credentials, process payments, and comply with legal requirements.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Confidentiality and Data Security</h2>
            <p>We adhere to the Data Protection Act, 2012 (Act 843) and implement reasonable safeguards to protect data. We will notify you in the event of a data breach.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Your Rights</h2>
            <p>You have the right to access, rectify, or erase your personal data. Please contact us to exercise these rights.</p>
        </div>
    )
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    content: () => (
        <div className="prose prose-lg text-gray-700 mx-auto">
            <p className="mb-4">This Cookie Policy explains how Optimedix Solutions Ltd. ("Optimedix") uses cookies and similar technologies.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. What are cookies?</h2>
            <p>Cookies are small data files placed on your device to make websites work more efficiently and provide reporting information.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How we use cookies</h2>
            <p>We use essential cookies for the operation of our Platform and other cookies to enhance user experience by tracking interests.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Your choices regarding cookies</h2>
            <p>You have the right to accept or reject cookies through your web browser controls.</p>
        </div>
    )
  }
};

const LegalPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms-of-service');

  useEffect(() => {
    if (section && legalSections[section]) {
      setActiveTab(section);
    } else {
      // Default to terms or navigate to a 404 page if the section is invalid
      setActiveTab('terms-of-service');
    }
  }, [section]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/legal/${tabKey}`, { replace: true });
  };
  
  const ActiveContent = legalSections[activeTab].content;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center" aria-label="Tabs">
              {Object.keys(legalSections).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => handleTabClick(tabKey)}
                  className={`${
                    activeTab === tabKey
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base transition-colors duration-300 focus:outline-none`}
                >
                  {legalSections[tabKey].title}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                    {legalSections[activeTab].title}
                </h1>
                <ActiveContent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
