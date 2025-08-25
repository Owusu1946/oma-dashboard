import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    UserGroupIcon, 
    ChatBubbleLeftRightIcon, 
    ArrowRightIcon,
    ArrowRightOnRectangleIcon,
    UserPlusIcon
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
        <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center">
            <motion.header 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                className="mt-4 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-slate-200/60"
            >
                <div className="px-6 py-3 flex items-center space-x-10">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                            <OMAIcon />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 hidden sm:block">OMA Health</h1>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors">Why Join Us</a>
                        <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link to="/doctor/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Log In
                        </Link>
                        <Link to="/doctor/register" className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors">
                            Register
                        </Link>
                    </div>
                </div>
            </motion.header>
        </div>

        {/* Mobile Bottom Navbar */}
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
        >
            <nav className="flex justify-around items-center h-20">
                <a href="#about" className="flex flex-col items-center justify-center text-slate-600 hover:text-slate-900 transition-colors h-full w-1/4">
                    <UserGroupIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium text-center">Why Join</span>
                </a>
                <a href="#testimonials" className="flex flex-col items-center justify-center text-slate-600 hover:text-slate-900 transition-colors h-full w-1/4">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium text-center">Stories</span>
                </a>
                <Link to="/doctor/login" className="flex flex-col items-center justify-center text-slate-600 hover:text-slate-900 transition-colors h-full w-1/4">
                    <ArrowRightOnRectangleIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium text-center">Log In</span>
                </Link>
                <Link to="/doctor/register" className="flex flex-col items-center justify-center h-full w-1/4 bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                    <UserPlusIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold text-center">Register</span>
                </Link>
            </nav>
        </motion.div>

        {/* Hero Section */}
        <main className="relative pt-12 md:pt-24 pb-24 md:pb-0">
            <div className="container mx-auto px-2 py-4 md:py-6 grid md:grid-cols-2 gap-12 items-center">
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
                            <p className="font-bold text-slate-900">100k+</p>
                            <p className="text-sm text-slate-500">Satisfied Patients</p>
                        </div>
                    </motion.div>
                    <motion.div 
                         initial={{ opacity: 0, y: -50, x: 50 }}
                         animate={{ opacity: 1, y: 0, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.8 }}
                         className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-lg"
                    >
                        <p className="font-semibold text-sm mb-2 text-slate-700">February, 2024</p>
                        <div className="flex space-x-3 text-sm">
                            <span className="text-slate-500">MON</span>
                            <span className="text-slate-500">TUE</span>
                            <span className="font-bold p-1 bg-blue-100 text-blue-600 rounded-full w-7 h-7 flex items-center justify-center">WED</span>
                            <span className="text-slate-500">THU</span>
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
                    <img src="https://img.freepik.com/free-photo/portrait-smiling-confident-male-doctor-with-arms-crossed_171337-5101.jpg?w=996" alt="Dr. Kweku" className="rounded-3xl shadow-xl"/>
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
                        <p className="text-slate-800 font-semibold mt-4">- Dr. Kweku</p>
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
      <section id="testimonials" className="bg-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by Doctors Everywhere</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">Don't just take our word for it. Here's what doctors in our network have to say about their experience with OMA Health.</p>
           <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
                <TestimonialCard 
                    quote="From the moment I walked into his office, I felt a sense of reassurance. His ability to thoroughly explain my condition and treatment options was exceptional."
                    name="Mark Williams"
                    location="New York, USA"
                    avatar="https://randomuser.me/api/portraits/men/42.jpg"
                />
                 <TestimonialCard 
                    quote="Thanks to Dr. John Smith, I am now living a happier and healthier life. I cannot recommend him enough."
                    name="Anderson Piter"
                    location="Carlton, UK"
                    avatar="https://randomuser.me/api/portraits/women/42.jpg"
                />
                <TestimonialCard 
                    quote="The platform is incredibly user-friendly and has allowed me to connect with patients from remote areas. It's a game-changer for healthcare in Africa."
                    name="Dr. Adama Diop"
                    location="Dakar, Senegal"
                    avatar="https://randomuser.me/api/portraits/women/43.jpg"
                />
            </motion.div>
        </div>
      </section>

        {/* Footer */}
        <footer id="contact" className="bg-slate-900 text-white">
            <div className="container mx-auto px-6 py-12 text-center">
                <p>&copy; {new Date().getFullYear()} OMA Health. All rights reserved.</p>
                <p className="text-slate-400 mt-2">Revolutionizing healthcare access in Africa.</p>
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
