import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserCheck, Calendar, Video, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { motion, useScroll, useTransform } from 'framer-motion';

export const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const yCards = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <PageTransition>
      <div className="page-wrapper p-0 overflow-hidden" ref={containerRef}>
        {/* Hero Section (Editorial Parallax) */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-8 py-24">
          {/* Abstract Backgrounds */}
          <div className="absolute inset-0 z-0 bg-[#f5faf8] overflow-hidden">
            <motion.div style={{ y: yBg }} className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[#d3e5f1]/40 blur-3xl opacity-70"></motion.div>
            <motion.div style={{ y: yBg }} className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-[#ccf2e3]/40 blur-3xl opacity-70"></motion.div>
          </div>

          <div className="max-w-[1280px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Typography */}
            <motion.div 
              className="lg:col-span-7 flex flex-col items-start"
              style={{ y: yText, opacity: opacityText }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffffff] border border-[#eaefed] shadow-sm text-[#00685f] text-xs font-bold uppercase tracking-widest mb-8">
                <ShieldCheck size={16} /> Secure Health Platform
              </div>
              
              <h1 className="font-['Plus_Jakarta_Sans'] text-[12vw] sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold text-[#171d1c] leading-[0.95] tracking-tighter mb-6">
                The future of <br/>
                <span className="text-[#00685f] relative inline-block">
                  medical care.
                  <svg className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-3 sm:h-6 text-[#89f5e7] -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="font-['Inter'] text-lg md:text-xl text-[#3d4947] mb-10 max-w-lg leading-relaxed font-medium">
                We're bridging the gap between top-tier specialists and patients. Experience seamless booking, digital records, and crystal-clear teleconsultations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/doctors')}
                  className="bg-[#171d1c] text-[#ffffff] px-8 py-4 rounded-full font-bold text-base hover:bg-[#00685f] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(23,29,28,0.2)] hover:shadow-[0_12px_32px_rgba(0,104,95,0.3)] hover:-translate-y-1 group"
                >
                  <Search size={20} className="group-hover:scale-110 transition-transform" />
                  Find a Specialist
                </button>
                <a
                  href="#how-it-works"
                  className="bg-[#ffffff] text-[#171d1c] border border-[#eaefed] px-8 py-4 rounded-full font-bold text-base hover:bg-[#f0f5f2] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 text-center"
                >
                  How it works
                </a>
              </div>
            </motion.div>

            {/* Right Column: Floating Bento Cards */}
            <motion.div 
              className="lg:col-span-5 relative h-[400px] md:h-[500px] w-full"
              style={{ y: yCards }}
            >
              {/* Doctor Card 1 */}
              <motion.div 
                initial={{ opacity: 0, x: 50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-[10%] right-[5%] w-[85%] md:w-[320px] bg-white/90 backdrop-blur-md p-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80" alt="Doctor" className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00835f] rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#171d1c]">Dr. Sarah Jenkins</h4>
                    <p className="text-xs font-medium text-[#00685f]">Cardiologist • Available</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="fill-[#b05e3d] text-[#b05e3d]" />
                      <span className="text-[10px] font-bold text-[#3d4947]">4.9 (120 reviews)</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Consultation Card */}
              <motion.div 
                initial={{ opacity: 0, x: -30, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-[15%] left-0 w-[70%] md:w-[260px] bg-[#00685f] p-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,104,95,0.2)] z-30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                    <Video size={20} />
                  </div>
                  <span className="text-white font-bold text-sm">Teleconsultation</span>
                </div>
                <p className="text-[#89f5e7] text-xs font-medium leading-relaxed">Connect with doctors globally through high-definition secure video calls.</p>
              </motion.div>

              {/* Decorative Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="absolute top-[25%] left-[10%] w-[70%] h-[60%] rounded-[32px] overflow-hidden shadow-2xl z-10"
              >
                <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=80" alt="Modern Clinic" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00685f]/40 to-transparent"></div>
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-[#ffffff] py-24 border-t border-[#eaefed]">
          <div className="px-4 md:px-8 max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-5xl font-extrabold text-[#171d1c] mb-4">
                Designed for <span className="text-[#00685f]">Simplicity</span>
              </h2>
              <p className="text-[#6d7a77] text-lg max-w-2xl mx-auto">Your journey to better health in four straightforward steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Search, title: 'Find', desc: 'Browse our curated list of verified medical professionals.' },
                { icon: UserCheck, title: 'Choose', desc: 'Compare profiles, read reviews, and find the perfect match.' },
                { icon: Calendar, title: 'Book', desc: 'Select a time slot and confirm your appointment instantly.' },
                { icon: Video, title: 'Consult', desc: 'Meet in-person or connect securely via video call.' }
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="bg-[#f5faf8] p-8 rounded-[32px] border border-[#eaefed] flex flex-col items-center text-center group transition-colors hover:border-[#00685f]/30 hover:bg-[#f0f5f2]"
                >
                  <div className="w-20 h-20 rounded-[24px] bg-[#ffffff] shadow-sm flex items-center justify-center mb-6 text-[#171d1c] group-hover:bg-[#00685f] group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                    <step.icon size={32} />
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#171d1c] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#6d7a77] font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};
