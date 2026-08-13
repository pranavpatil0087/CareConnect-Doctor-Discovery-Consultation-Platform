import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import {
  Calendar, Clock, User, CheckCircle, XCircle, FileText,
  Activity, AlertCircle, Video, MapPin, ActivitySquare, Pill, ArrowRight,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const appts = await doctorService.getDoctorAppointments();
      setAppointments(appts || []);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = (appts || []).filter(a => a.date?.startsWith(today)).length;
      const pending = (appts || []).filter(a => a.status === 'pending').length;

      setStats({
        totalPatients: 142,
        todayAppointments: todayAppts,
        pendingRequests: pending,
        totalEarnings: 45000
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await doctorService.updateAppointmentStatus(appointmentId, status);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'upcoming') return appt.status === 'scheduled';
    if (activeTab === 'pending') return appt.status === 'pending';
    if (activeTab === 'completed') return appt.status === 'completed';
    return true;
  });

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccf2e3] text-[#00835f] text-xs font-bold uppercase tracking-widest mb-3">
              <CheckCircle size={14} /> Available for Consults
            </div>
            <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] text-[#171d1c] tracking-tight mb-2">
              Dr. {user?.name?.split(' ')[0] || 'Doctor'}
            </h1>
            <p className="text-[#6d7a77] text-lg font-medium">Here is your clinical overview for today.</p>
          </div>
          <button className="bg-[#171d1c] hover:bg-[#00685f] text-[#ffffff] px-6 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-[0_8px_20px_rgba(0,104,95,0.25)] hover:-translate-y-0.5 flex items-center gap-2 w-full md:w-auto justify-center">
            <Video size={20} /> Start Quick Consult
          </button>
        </div>

        {/* Bento Box Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Main Stat Card - Earnings (Col 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-[#00685f] text-white rounded-[32px] p-8 shadow-[0_12px_24px_rgba(0,104,95,0.2)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <ActivitySquare size={120} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[#89f5e7] font-bold text-sm uppercase tracking-widest mb-2">Total Earnings</h3>
              <div className="text-5xl font-black font-['Plus_Jakarta_Sans'] mb-4">
                ₹{(stats.totalEarnings / 1000).toFixed(1)}k
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-sm font-bold">
                <TrendingUp size={16} /> +12.5% this week
              </div>
            </div>
          </motion.div>

          {/* Pending Requests Alert (Col 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-[#fff8e6] rounded-[32px] p-8 border border-[#ffdf80] flex flex-col justify-between relative group hover:bg-[#fff3cc] transition-colors cursor-pointer" onClick={() => setActiveTab('pending')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-[#ffcc33] text-[#7a5c00] rounded-2xl flex items-center justify-center shadow-inner">
                <AlertCircle size={28} />
              </div>
              <span className="text-[#997300] font-bold text-sm bg-[#ffedcc] px-3 py-1 rounded-full">Action Needed</span>
            </div>
            <div>
              <h3 className="text-3xl font-black font-['Plus_Jakarta_Sans'] text-[#5c4500] mb-1">{stats.pendingRequests}</h3>
              <p className="text-[#997300] font-bold">Pending Consultations</p>
            </div>
          </motion.div>

          {/* Quick Actions (Col 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-[#ffffff] rounded-[32px] border border-[#eaefed] p-8 flex flex-col justify-between">
            <h3 className="font-bold text-[#171d1c] mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#f0f5f2] hover:bg-[#d3e5f1] hover:text-[#00685f] text-[#3d4947] font-bold transition-all group">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="group-hover:text-[#00685f]" />
                  <span>Write Prescription</span>
                </div>
                <ArrowRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#f0f5f2] hover:bg-[#d3e5f1] hover:text-[#00685f] text-[#3d4947] font-bold transition-all group">
                <div className="flex items-center gap-3">
                  <User size={18} className="group-hover:text-[#00685f]" />
                  <span>Patient Database</span>
                </div>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Appointments Section (Col 12) */}
          <motion.div variants={itemVariants} className="md:col-span-12 bg-[#ffffff] rounded-[32px] border border-[#eaefed] shadow-sm flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-[#eaefed] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#ffffff]">
              <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                Schedule Overview
              </h2>
              
              {/* Animated Tab Switcher */}
              <div className="flex bg-[#eaefed] p-1.5 rounded-2xl relative w-full sm:w-auto overflow-x-auto no-scrollbar">
                {['upcoming', 'pending', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-[#00685f]' : 'text-[#6d7a77] hover:text-[#171d1c]'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="doctorTabBubble" className="absolute inset-0 bg-[#ffffff] rounded-xl shadow-sm -z-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 flex-1 bg-[#ffffff]">
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-full h-28 bg-[#eaefed] animate-pulse rounded-[24px]"></div>
                  ))}
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {filteredAppointments.map((appt) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={appt.id} 
                        className="group flex flex-col justify-between p-6 rounded-[24px] border border-[#eaefed] hover:border-[#bcc9c6] hover:shadow-md transition-all bg-[#ffffff]"
                      >
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-16 h-16 rounded-[20px] bg-[#f0f5f2] text-[#00685f] flex flex-col items-center justify-center shrink-0 border border-[#d3e5f1] shadow-inner">
                            <span className="text-lg font-black leading-none">{appt.time?.split(':')[0]}</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase mt-1">
                              {parseInt(appt.time?.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-[#171d1c] text-lg">
                                {appt.patient?.name || 'Unknown Patient'}
                              </h4>
                              {appt.type === 'video' ? (
                                <span className="bg-[#ccf2e3] text-[#00835f] p-1.5 rounded-lg"><Video size={14}/></span>
                              ) : (
                                <span className="bg-[#e6d9f2] text-[#6b3399] p-1.5 rounded-lg"><MapPin size={14}/></span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs font-semibold text-[#6d7a77]">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#bcc9c6]" /> {appt.date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} className="text-[#bcc9c6]" /> {appt.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {appt.symptoms && (
                          <div className="mb-6 text-sm bg-[#f5faf8] p-4 rounded-2xl border border-[#eaefed] text-[#3d4947] font-medium line-clamp-2">
                            <span className="font-bold text-[#171d1c] text-[10px] uppercase tracking-widest block mb-1">Reported Symptoms</span>
                            {appt.symptoms}
                          </div>
                        )}

                        <div className="flex gap-3 mt-auto">
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(appointment.id, 'scheduled')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00685f] hover:bg-[#008378] text-[#ffffff] rounded-xl text-sm font-bold transition-all shadow-sm hover:-translate-y-0.5"
                              >
                                <CheckCircle size={16} /> Accept
                              </button>
                              <button
                                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border border-[#ffb4ab] text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl text-sm font-bold transition-colors"
                              >
                                <XCircle size={16} /> Decline
                              </button>
                            </>
                          )}
                          
                          {activeTab === 'upcoming' && (
                            <>
                              {appt.type === 'video' && (
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#171d1c] hover:bg-[#00685f] text-[#ffffff] rounded-xl text-sm font-bold transition-all shadow-sm hover:-translate-y-0.5">
                                  <Video size={16} /> Join Call
                                </button>
                              )}
                              <button
                                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border-2 border-[#eaefed] text-[#171d1c] hover:border-[#00685f] hover:text-[#00685f] rounded-xl text-sm font-bold transition-all"
                              >
                                Mark Done
                              </button>
                            </>
                          )}

                          {activeTab === 'completed' && (
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border-2 border-[#eaefed] text-[#171d1c] hover:border-[#00685f] hover:text-[#00685f] rounded-xl text-sm font-bold transition-all">
                              <FileText size={16} /> View Notes
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-[#f0f5f2] rounded-full flex items-center justify-center mb-6 text-[#bcc9c6]">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] mb-2">No appointments</h3>
                  <p className="text-[#6d7a77] text-base">There are no {activeTab} appointments at this time.</p>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
