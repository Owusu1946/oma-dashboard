import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserGroupIcon, 
    ChatBubbleLeftRightIcon, 
    ArrowRightIcon,
    ArrowRightOnRectangleIcon,
    UserPlusIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';


const OMAIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

export default function LandingPage() {
    useEffect(() => {
        document.title = "OMA: Empowering African Doctors";
        const updateMetaDescription = (content) => {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = "description";
                document.head.appendChild(meta);
            }
            meta.content = content;
        };
        updateMetaDescription("Join OMA Health to connect with patients, manage your practice seamlessly, and supplement your income. Your expertise, our platform.");
    }, []);

    const testimonials = [
        {
            quote: "From the moment I walked into his office, I felt a sense of reassurance. His ability to thoroughly explain my condition and treatment options was exceptional.",
            name: "Mark Williams",
            location: "New York, USA",
            avatar: "https://randomuser.me/api/portraits/men/42.jpg",
        },
        {
            quote: "Thanks to Dr. John Smith, I am now living a happier and healthier life. I cannot recommend him enough.",
            name: "Anderson Piter",
            location: "Carlton, UK",
            avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        },
        {
            quote: "The platform is incredibly user-friendly and has allowed me to connect with patients from remote areas. It's a game-changer for healthcare in Africa.",
            name: "Dr. Joel Boakye",
            location: "Accra, Ghana",
            avatar: "/Joel.jpg",
        },
    ];

    const [activeTestimonial, setActiveTestimonial] = useState(2);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2 },
        },
      };
    
      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 100 },
        },
      };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
        {/* Header */}
        <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        >
            <div className="mt-4 mx-4 md:mx-0 w-full md:w-auto bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-slate-200/60">
                <div className="px-6 py-3 flex items-center justify-between space-x-10">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src="/optimedix-logo.png" alt="Optimedix Logo" className="w-10 h-10" />
                        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">OMA</h1>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors">Why Join Us</a>
                        <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/doctor/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Log In
                        </Link>
                        <Link to="/doctor/register" className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors">
                            Register
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative w-8 h-8 text-slate-900">
                            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>

        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "-100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-100%" }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className="fixed inset-0 z-40 bg-white/95 backdrop-blur-lg"
                >
                    <div className="h-full flex flex-col items-center justify-center pt-20">
                        <nav className="flex flex-col items-center space-y-8">
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold text-slate-700 hover:text-slate-900 transition-colors">Why Join Us</a>
                            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold text-slate-700 hover:text-slate-900 transition-colors">Testimonials</a>
                        </nav>
                        <div className="mt-12 flex flex-col items-center space-y-6 w-full px-8">
                             <Link to="/doctor/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center border border-slate-300 text-slate-700 px-8 py-3 rounded-full font-medium hover:bg-slate-100 transition-colors">
                                Log In
                            </Link>
                            <Link to="/doctor/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
                                Register
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Hero Section */}
        <main className="relative pt-24 md:pt-32 pb-24">
            <div className="container mx-auto px-4 py-4 md:py-6 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center md:text-left"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
                    >
                        For Medical Professionals
                    </motion.div>
                    <motion.h1 
                        variants={itemVariants} 
                        className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
                    >
                        Empowering African Doctors
                    </motion.h1>
                    <motion.p 
                        variants={itemVariants} 
                        className="text-lg text-slate-600 mb-10 max-w-xl mx-auto md:mx-0"
                    >
                        Join OMA Health to connect with patients, manage your practice seamlessly, and supplement your income. Your expertise, our platform.
                    </motion.p>
                    <motion.div variants={itemVariants} className="flex justify-center md:justify-start">
                        <Link to="/doctor/dashboard">
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg shadow-slate-900/20 flex items-center space-x-3">
                                <span>Access Your Dashboard</span>
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
                <motion.div 
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <img 
                        src="/dash1.png"
                        alt="OMA Health Doctor Dashboard"
                        className="rounded-3xl shadow-2xl"
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-lg flex items-center space-x-4"
                    >
                        <div className="flex -space-x-2">
                           <img className="h-10 w-10 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/women/71.jpg" alt="patient"/>
                           <img className="h-10 w-10 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="patient"/>
                           <img className="h-10 w-10 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/women/12.jpg" alt="patient"/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">1k+</p>
                            <p className="text-sm text-slate-500">Satisfied Patients</p>
                        </div>
                    </motion.div>
                    <motion.div 
                         initial={{ opacity: 0, y: -50, x: 50 }}
                         animate={{ opacity: 1, y: 0, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.8 }}
                         className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-200/60"
                    >
                        <p className="font-semibold text-sm mb-3 text-slate-700">Bookings This Week</p>
                        <div className="flex space-x-2 text-sm">
                            <Day initial="M" full="MON" appointments={2} />
                            <Day initial="T" full="TUE" appointments={5} />
                            <Day initial="W" full="WED" appointments={8} active />
                            <Day initial="T" full="THU" appointments={3} />
                            <Day initial="F" full="FRI" appointments={6} />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                        className="absolute top-24 -left-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-200/60 flex items-center space-x-3"
                    >
                        <div className="w-10 h-10 bg-amber-100 text-amber-500 flex items-center justify-center rounded-full">
                            <StarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">4.9/5</p>
                            <p className="text-sm text-slate-500">Avg. Rating</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>

        {/* About Section */}
        <section id="about" className="py-20 bg-slate-50">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                     initial={{ opacity: 0, x: -50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 0.5 }}
                     className="relative"
                >
                    <img src="/Joel.jpg" alt="Dr. Joel Boakye" className="rounded-3xl shadow-xl"/>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="absolute -bottom-8 left-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60"
                    >
                        <p className="text-2xl font-bold text-slate-900">Flexible Earnings</p>
                        <p className="text-slate-500">Supplement your income on your schedule.</p>
                    </motion.div>
                </motion.div>
                 <motion.div
                     initial={{ opacity: 0, x: 50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                 >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Work On Your Terms. <br /> Make a Difference.</h2>
                    <div className="border-l-4 border-blue-500 pl-6 mb-8">
                        <p className="text-slate-600 text-lg italic">"As a doctor with a full-time job, OMA Health provides the perfect platform to utilize my skills and earn extra income during my free hours. The flexibility is unmatched."</p>
                        <p className="text-slate-800 font-semibold mt-4">- Dr. Joel Boakye</p>
                    </div>
                    <p className="text-slate-600 text-lg mb-8">
                        Join a network of professionals leveraging OMA Health to connect with patients, provide care, and build a supplementary income stream—all while maintaining their primary employment.
                    </p>
                    <Link to="/doctor/register">
                        <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg shadow-slate-900/20 flex items-center space-x-3">
                            <span>Join Our Network</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>

        {/* Testimonials */}
      <section id="testimonials" className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by Doctors Everywhere</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">Don't just take our word for it. Here's what doctors in our network have to say about their experience with OMA Health.</p>
          
          <div className="max-w-3xl mx-auto">
              <div className="relative h-40 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                      <motion.div
                          key={activeTestimonial}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                      >
                          <p className="text-2xl italic text-slate-700 leading-relaxed">"{testimonials[activeTestimonial].quote}"</p>
                      </motion.div>
                  </AnimatePresence>
              </div>

              <motion.div 
                  key={activeTestimonial + 'author'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-8"
              >
                  <p className="text-xl font-bold text-slate-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-slate-500">{testimonials[activeTestimonial].location}</p>
              </motion.div>
              
              <div className="flex justify-center items-center space-x-4 mt-12">
                  {testimonials.map((testimonial, index) => (
                      <motion.button
                          key={index}
                          onClick={() => setActiveTestimonial(index)}
                          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                      >
                          <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name} 
                              className={`w-16 h-16 rounded-full object-cover transition-all duration-300 border-4 border-transparent ${activeTestimonial === index ? 'border-blue-500' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                          />
                      </motion.button>
                  ))}
              </div>
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer id="contact" className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand Info */}
                    <div className="col-span-4 md:col-span-1">
                         <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img src="/optimedix-logo.png" alt="Optimedix Logo" className="w-10 h-10" />
                            <h1 className="text-xl font-bold text-white">Optimedix</h1>
                        </Link>
                        <p className="text-slate-400 mt-2 max-w-xs">Revolutionizing healthcare access in Africa with OMA, one consultation at a time.</p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-semibold text-white mb-4 tracking-wider">Quick Links</h3>
                        <nav className="flex flex-col space-y-3">
                             <a href="#about" className="hover:text-white transition-colors">About Us</a>
                             <a href="#testimonials" className="hover:text-white transition-colors">Services</a>
                             <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                        </nav>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="col-span-4 md:col-span-2">
                        <h3 className="font-semibold text-white mb-4 tracking-wider">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="w-5 h-5 mt-1 text-slate-400" />
                                <span>123 Medical Street, Health City</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <PhoneIcon className="w-5 h-5 mt-1 text-slate-400" />
                                <div>
                                    <p>+233 55 918 2794</p>
                                    <p>+233 57 103 8248</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <EnvelopeIcon className="w-5 h-5 mt-1 text-slate-400" />
                                <span>contact@optimedixai.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-slate-400 text-center md:text-left">
                        <p>&copy; {new Date().getFullYear()} Optimedix. All rights reserved.</p>
                        <div className="mt-2 md:mt-0">
                            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <span className="mx-2">|</span>
                            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Use</Link>
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-6 md:mt-0">
                        {/* X (Twitter) */}
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z"/></svg>
                        </SocialIcon>
                        {/* LinkedIn */}
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                        </SocialIcon>
                        {/* Facebook */}
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.593 0 8.049c0 4.051 2.956 7.424 6.838 7.951v-5.625h-2.03V8.05H6.838V6.22c0-2.014 1.205-3.111 3.022-3.111.875 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.882-.527 6.75-3.901 6.75-7.951z"/></svg>
                        </SocialIcon>
                         {/* Instagram */}
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.282.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  );
}

const ServiceCard = ({icon, title, description}) => (
    <motion.div variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 100 },
        },
      }} className="bg-white p-8 rounded-2xl border border-slate-200/60 h-full">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto mb-6">
           {React.cloneElement(icon, { className: "w-8 h-8"})}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </motion.div>
);

const TestimonialCard = ({ quote, name, location, avatar }) => (
    <motion.div variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 100 },
        },
      }} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-lg h-full flex flex-col justify-between">
        <div>
        <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-amber-400" />)}
        </div>
        <p className="text-slate-600 text-lg italic mb-6">"{quote}"</p>
        </div>
        <div className="flex items-center">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4"/>
            <div>
                <p className="font-semibold text-slate-800">{name}</p>
                <p className="text-sm text-slate-500">{location}</p>
            </div>
        </div>
    </motion.div>
);

const Day = ({ initial, full, appointments, active }) => (
    <div className="relative group flex flex-col items-center">
        <span className={`font-medium p-1 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            active 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 group-hover:bg-slate-100'
        }`}>
            {initial}
        </span>
        <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-800 text-white text-xs rounded-lg py-1 px-2 pointer-events-none">
            {appointments} bookings
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 transform rotate-45"></div>
        </div>
    </div>
);

const SocialIcon = ({ href, children }) => (
    <a href={href} className="text-slate-400 hover:text-white transition-colors">
        {children}
    </a>
);
