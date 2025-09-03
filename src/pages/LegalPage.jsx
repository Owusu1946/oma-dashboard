import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, ArrowUpIcon, ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const legalSections = {
  'terms-of-service': {
    title: 'Terms of Service',
    headings: [
      { id: 'tos-services', title: 'Services & Covenants' },
      { id: 'tos-independent-contractor', title: 'Independent Contractor' },
      { id: 'tos-compensation', title: 'Compensation & Payment' },
      { id: 'tos-commission', title: 'Commission Rate Adjustment' },
      { id: 'tos-confidentiality', title: 'Confidentiality' },
      { id: 'tos-liability', title: 'Liability & Indemnification' },
      { id: 'tos-term', title: 'Term & Termination' },
      { id: 'tos-dispute', title: 'Dispute Resolution' },
      { id: 'tos-governing-law', title: 'Governing Law' },
      { id: 'tos-entire-agreement', title: 'Entire Agreement' },
    ],
    content: () => (
      <div className="prose prose-lg max-w-none text-slate-700 prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200/80 prose-h2:mb-4 prose-h2:mt-10">
        <p className="lead text-lg text-slate-600">This Telemedicine Services Agreement ("Agreement") is made between Optimedix Solutions Ltd. ("Optimedix") and the licensed medical practitioner ("Doctor") using this platform.</p>
        <h2 id="tos-services">1. Services and Doctor’s Covenants</h2>
        <p>The Doctor agrees to provide professional, timely, and competent medical consultation services to patients via the Optimedix telemedicine platform (the “Platform”). The Doctor covenants and warrants that they shall:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Service Limitations:</strong> Acknowledge and agree that the Platform is intended for non-emergency medical consultations only...</li>
          <li><strong>Professional Standing & Licensure:</strong> Maintain a valid, unrestricted license to practice medicine...</li>
          <li><strong>Professional Liability Insurance:</strong> Obtain and maintain, at their own expense, a professional liability (malpractice) insurance policy...</li>
        </ul>
        <h2 id="tos-independent-contractor">2. Independent Contractor Status</h2>
        <p>It is expressly understood that the Doctor is an independent contractor and not an employee, agent, or partner of Optimedix...</p>
        <h2 id="tos-compensation">3. Compensation & Payment</h2>
        <p>Details regarding consultation fees, commission, and payment schedules are outlined in the agreement...</p>
        <h2 id="tos-commission">4. Commission Rate Adjustment</h2>
        <p>Optimedix reserves the right to review and adjust the commission rate with prior written notice...</p>
        <h2 id="tos-confidentiality">5. Confidentiality and Data Security</h2>
        <p>Both parties agree to maintain the strict confidentiality of all patient information and proprietary business information...</p>
        <h2 id="tos-liability">6. Liability and Indemnification</h2>
        <p>The Doctor shall indemnify Optimedix from claims arising from their provision of medical services. Optimedix shall indemnify the Doctor from claims arising from a gross technical failure of the Platform...</p>
        <h2 id="tos-term">7. Term and Termination</h2>
        <p>This Agreement can be terminated by either party with thirty (30) days' written notice. Immediate termination clauses are also included...</p>
        <h2 id="tos-dispute">8. Dispute Resolution</h2>
        <p>Disputes shall first be attempted to be resolved through good faith negotiations, followed by mediation...</p>
        <h2 id="tos-governing-law">9. Governing Law</h2>
        <p>This Agreement shall be governed by the laws of the Republic of Ghana...</p>
        <h2 id="tos-entire-agreement">10. Entire Agreement</h2>
        <p>This Agreement constitutes the entire agreement between the parties...</p>
      </div>
    )
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    headings: [
        { id: 'privacy-info-collected', title: 'Information We Collect' },
        { id: 'privacy-info-use', title: 'How We Use Information' },
        { id: 'privacy-confidentiality', title: 'Confidentiality & Security' },
        { id: 'privacy-rights', title: 'Your Rights' },
    ],
    content: () => (
        <div className="prose prose-lg max-w-none text-slate-700 prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200/80 prose-h2:mb-4 prose-h2:mt-10">
            <p className="lead text-lg text-slate-600">This Privacy Policy outlines how Optimedix Solutions Ltd. ("Optimedix") collects, uses, and protects your information when you use our telemedicine platform.</p>
            <h2 id="privacy-info-collected">1. Information We Collect</h2>
            <p>We collect information necessary to provide our services, including personal identification, professional information, and patient information shared during consultations.</p>
            <h2 id="privacy-info-use">2. How We Use Your Information</h2>
            <p>Your information is used to facilitate consultations, verify credentials, process payments, and comply with legal requirements.</p>
            <h2 id="privacy-confidentiality">3. Confidentiality and Data Security</h2>
            <p>We adhere to the Data Protection Act, 2012 (Act 843) and implement reasonable safeguards to protect data. We will notify you in the event of a data breach.</p>
            <h2 id="privacy-rights">4. Your Rights</h2>
            <p>You have the right to access, rectify, or erase your personal data. Please contact us to exercise these rights.</p>
        </div>
    )
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    headings: [
        { id: 'cookie-what-are', title: 'What are cookies?' },
        { id: 'cookie-how-use', title: 'How we use cookies' },
        { id: 'cookie-choices', title: 'Your choices' },
    ],
    content: () => (
        <div className="prose prose-lg max-w-none text-slate-700 prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200/80 prose-h2:mb-4 prose-h2:mt-10">
            <p className="lead text-lg text-slate-600">This Cookie Policy explains how Optimedix Solutions Ltd. ("Optimedix") uses cookies and similar technologies.</p>
            <h2 id="cookie-what-are">1. What are cookies?</h2>
            <p>Cookies are small data files placed on your device to make websites work more efficiently and provide reporting information.</p>
            <h2 id="cookie-how-use">2. How we use cookies</h2>
            <p>We use essential cookies for the operation of our Platform and other cookies to enhance user experience by tracking interests.</p>
            <h2 id="cookie-choices">3. Your choices regarding cookies</h2>
            <p>You have the right to accept or reject cookies through your web browser controls.</p>
        </div>
    )
  }
};

const LegalPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms-of-service');
  const [activeHeading, setActiveHeading] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    if (section && legalSections[section]) {
      setActiveTab(section);
    } else {
      setActiveTab('terms-of-service');
    }
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [section]);

  useEffect(() => {
    const headings = legalSections[activeTab].headings;
    const contentArea = contentRef.current;
    if (!headings || headings.length === 0 || !contentArea) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break; 
          }
        }
      },
      { root: contentArea, rootMargin: `0px 0px -75% 0px`, threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [activeTab]);

  useEffect(() => {
    const contentArea = contentRef.current;
    if (!contentArea) return;

    const checkScrollTop = () => {
      if (contentArea.scrollTop > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    contentArea.addEventListener('scroll', checkScrollTop);
    return () => {
      if (contentArea) {
        contentArea.removeEventListener('scroll', checkScrollTop);
      }
    };
  }, []);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/legal/${tabKey}`, { replace: true });
  };

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const ActiveContent = legalSections[activeTab].content;
  const activeHeadings = legalSections[activeTab].headings || [];

  return (
    <div className="bg-white h-screen flex flex-col">
      <header className="border-b border-slate-200 shrink-0 z-10 bg-white/75 backdrop-blur-sm sticky top-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-32">
                <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium inline-flex items-center text-sm whitespace-nowrap">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Home
                </Link>
            </div>
            <div className="flex-1 flex justify-center px-2 min-w-0">
                <nav className="flex items-center overflow-x-auto" aria-label="Tabs">
                  {Object.keys(legalSections).map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => handleTabClick(tabKey)}
                      className={`shrink-0 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 mx-1 ${
                        activeTab === tabKey
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      {legalSections[tabKey].title}
                    </button>
                  ))}
                </nav>
            </div>
            <div className="w-32 hidden sm:block" /> {/* Spacer to balance the back button */}
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-12 flex-grow overflow-hidden">
        <aside className="hidden lg:block lg:col-span-3 py-8 pl-8 pr-4 lg:border-r lg:border-slate-200 h-full overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase sticky top-0 bg-white pb-2">On this page</h3>
            <ul className="mt-4 space-y-2">
              {activeHeadings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleScrollTo(heading.id);
                    }}
                    className={`block transition-colors duration-200 p-2 rounded-md font-medium ${
                      activeHeading === heading.id
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  >
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
    
            <main ref={contentRef} className="py-8 px-4 sm:px-6 lg:px-12 lg:col-span-9 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="lg:hidden mb-8">
                    <button
                        onClick={() => setIsTocOpen(!isTocOpen)}
                        className="w-full flex items-center justify-between p-3 bg-slate-100 rounded-lg text-slate-800 font-semibold text-left"
                    >
                        <span>On this page</span>
                        <ChevronDownIcon
                        className={`h-5 w-5 transition-transform duration-200 ${isTocOpen ? 'transform rotate-180' : ''}`}
                        />
                    </button>
                    <AnimatePresence>
                        {isTocOpen && (
                            <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 space-y-1 bg-white border border-slate-200 rounded-lg p-2 overflow-hidden"
                            >
                                {activeHeadings.map((heading) => (
                                <li key={heading.id}>
                                    <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleScrollTo(heading.id);
                                        setIsTocOpen(false);
                                    }}
                                    className={`block transition-colors duration-200 p-2 rounded-md font-medium text-sm ${
                                        activeHeading === heading.id
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                                    }`}
                                    >
                                    {heading.title}
                                    </a>
                                </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center mb-6">
                    <BookOpenIcon className="h-8 w-8 text-slate-400 mr-3 flex-shrink-0" />
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {legalSections[activeTab].title}
                    </h1>
                  </div>
                  <ActiveContent />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          
          <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 z-50"
            aria-label="Scroll to top"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalPage;
