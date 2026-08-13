import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { 
  Calendar, Clock, User, FileText, Search, Plus, 
  MapPin, Phone, Activity, ChevronRight, Video, ArrowRight
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const appts = await patientService.getPatientAppointments();
      setAppointments(appts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'upcoming') return appt.status === 'scheduled' || appt.status === 'pending';
    if (activeTab === 'past') return appt.status === 'completed' || appt.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-[#ccf2e3] text-[#00835f]';
      case 'completed': return 'bg-[#d3e5f1] text-[#00685f]';
      case 'pending': return 'bg-[#ffedcc] text-[#cc7a00]';
      case 'cancelled': return 'bg-[#ffdad6] text-[#ba1a1a]';
      default: return 'bg-[#f0f5f2] text-[#6d7a77]';
    }
  };

  // Bento Box Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f5faf8] pt-32 pb-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] text-[#171d1c] tracking-tight mb-2">
              Welcome, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-[#6d7a77] text-lg font-medium">Your personal health command center.</p>
          </div>
          <button 
            onClick={() => navigate('/doctors')}
            className="bg-[#00685f] hover:bg-[#008378] text-[#ffffff] px-6 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-[0_8px_20px_rgba(0,104,95,0.25)] hover:-translate-y-0.5 flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus size={20} /> Book Appointment
          </button>
        </div>

        {/* Bento Box Grid Layout */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          
          {/* Bento Item 1: Profile & Vitals (Col span 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-[#ffffff] rounded-[32px] p-8 border border-[#eaefed] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
              <User size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#d3e5f1] rounded-[20px] text-[#00685f] flex items-center justify-center text-2xl font-bold shadow-inner">
                  {user?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                    {user?.name || 'Patient Name'}
                  </h3>
                  <p className="text-[#6d7a77] text-sm font-medium">{user?.email || 'patient@example.com'}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f5f2] flex items-center justify-center text-[#6d7a77]">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6d7a77] font-bold">Blood Group</p>
                    <p className="font-semibold text-[#171d1c]">O Positive</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f5f2] flex items-center justify-center text-[#6d7a77]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6d7a77] font-bold">Contact</p>
                    <p className="font-semibold text-[#171d1c]">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-3 border-2 border-[#eaefed] rounded-xl text-sm font-bold text-[#171d1c] hover:bg-[#f0f5f2] transition-colors relative z-10">
              Edit Profile
            </button>
          </motion.div>

          {/* Bento Item 2: Appointments Section (Col span 8) */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-[#ffffff] rounded-[32px] border border-[#eaefed] shadow-sm flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-[#eaefed] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff]">
              <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                Your Appointments
              </h2>
              
              {/* Animated Tab Switcher */}
              <div className="flex bg-[#eaefed] p-1 rounded-2xl relative">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'upcoming' ? 'text-[#00685f]' : 'text-[#6d7a77] hover:text-[#171d1c]'}`}
                >
                  Upcoming
                  {activeTab === 'upcoming' && (
                    <motion.div layoutId="patientTabBubble" className="absolute inset-0 bg-[#ffffff] rounded-xl shadow-sm -z-10" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'past' ? 'text-[#00685f]' : 'text-[#6d7a77] hover:text-[#171d1c]'}`}
                >
                  Past
                  {activeTab === 'past' && (
                    <motion.div layoutId="patientTabBubble" className="absolute inset-0 bg-[#ffffff] rounded-xl shadow-sm -z-10" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-8 flex-1 bg-[#ffffff]">
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-full h-24 bg-[#eaefed] animate-pulse rounded-2xl"></div>
                  ))}
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {filteredAppointments.map((appt) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={appt.id} 
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] border border-[#eaefed] hover:border-[#bcc9c6] hover:bg-[#f0f5f2] transition-colors"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[#ffffff] border border-[#eaefed] flex flex-col items-center justify-center shrink-0 group-hover:border-[#bcc9c6] transition-colors shadow-sm">
                            <span className="text-xs font-bold text-[#171d1c]">{appt.date?.split('-')[2] || '??'}</span>
                            <span className="text-[10px] font-bold text-[#6d7a77] uppercase">
                              {new Date(appt.date).toLocaleString('default', { month: 'short' })}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-[#171d1c] text-lg">
                                Dr. {appt.doctor?.name || 'Doctor'}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-[#00685f] mb-2">{appt.doctor?.specialization?.name || 'General Physician'}</p>
                            
                            <div className="flex items-center gap-4 text-xs font-semibold text-[#6d7a77]">
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} /> {appt.time}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Video size={14} /> {appt.type || 'Teleconsult'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {appt.status === 'scheduled' && (
                          <button className="sm:w-auto w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#171d1c] hover:bg-[#00685f] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <Video size={16} /> Join Call
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-[#f0f5f2] rounded-[24px] flex items-center justify-center mb-4 text-[#bcc9c6]">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">No {activeTab} appointments</h3>
                  <p className="text-[#6d7a77] text-sm mt-2 mb-6 max-w-xs mx-auto">Your schedule is clear. Book an appointment when you need care.</p>
                  <button onClick={() => navigate('/doctors')} className="text-[#00685f] font-bold hover:underline flex items-center gap-1">
                    Find a Doctor <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bento Item 3: Stats Mini (Col span 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-[#00685f] text-white rounded-[32px] p-8 shadow-[0_12px_24px_rgba(0,104,95,0.2)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
            
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                <Calendar size={24} />
              </div>
              <h3 className="text-4xl font-black font-['Plus_Jakarta_Sans'] mb-2">{appointments.filter(a => a.status === 'scheduled').length}</h3>
              <p className="font-semibold text-[#89f5e7]">Upcoming Visits</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm font-medium opacity-90">Next checkup in <strong className="text-white">3 days</strong>.</p>
            </div>
          </motion.div>

          {/* Bento Item 4: Medical Records (Col span 8) */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-gradient-to-r from-[#d3e5f1] to-[#e6f0f7] rounded-[32px] p-8 border border-[#bcc9c6]/30 flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-[#00685f] group-hover:scale-105 transition-transform">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] mb-2">
                  Digital Health Records
                </h3>
                <p className="text-[#50616b] font-medium max-w-sm">
                  Access prescriptions, lab results, and medical history instantly.
                </p>
              </div>
            </div>
            <button className="bg-white text-[#171d1c] px-6 py-3 rounded-full font-bold shadow-sm group-hover:bg-[#00685f] group-hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap">
              View Records <ArrowRight size={16} />
            </button>
          </motion.div>

        </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
