import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { Modal } from '../components/common/Modal';
import {
  Calendar, Clock, User, CheckCircle, XCircle, FileText,
  Activity, AlertCircle, Video, MapPin, ActivitySquare, Pill, ArrowRight,
  TrendingUp, TrendingDown, Search, X
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Write Prescription Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medicines, setMedicines] = useState('');
  const [submittingPrescription, setSubmittingPrescription] = useState(false);

  // Patient Database Modal State
  const [isPatientDatabaseOpen, setIsPatientDatabaseOpen] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appts, docProfile] = await Promise.all([
        appointmentService.getDoctorAppointments().catch(() => []),
        doctorService.getDoctorProfile().catch(() => null)
      ]);

      setAppointments(appts || []);
      if (docProfile && docProfile.availability !== undefined) {
        setIsAvailable(docProfile.availability);
      }

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = (appts || []).filter(a => (a.appointmentDate || a.date)?.startsWith(today)).length;
      const pending = (appts || []).filter(a => a.status?.toLowerCase() === 'pending').length;

      let earnings = 0;
      try {
        const earningsRes = await doctorService.getYearlyEarnings();
        if (earningsRes?.data?.amountCollected !== undefined) {
          earnings = earningsRes.data.amountCollected;
        }
      } catch (e) {
        earnings = (appts || [])
          .filter(a => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + (Number(a.amountPaid) || 500), 0);
      }

      setStats({
        totalPatients: (appts || []).length,
        todayAppointments: todayAppts,
        pendingRequests: pending,
        totalEarnings: earnings
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      await doctorService.updateAvailability(nextState);
      setIsAvailable(nextState);
      toast.success(`Availability status set to ${nextState ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      toast.error('Failed to update availability status');
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await appointmentService.updateStatus(appointmentId, status);
      toast.success(`Appointment status updated to ${status}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status.');
    }
  };

  const handleStartQuickConsult = () => {
    const activeCall = appointments.find(a => (a.status === 'BOOKED' || a.status === 'BOOKED') && a.consultationMedium === 'VIDEO');
    if (activeCall && activeCall.bookingId) {
      navigate(`/video-call/${activeCall.bookingId}`);
    } else {
      const anyBooked = appointments.find(a => a.status === 'BOOKED');
      if (anyBooked && anyBooked.bookingId) {
        navigate(`/video-call/${anyBooked.bookingId}`);
      } else {
        toast.error('No active video consultation appointments scheduled for today.');
      }
    }
  };

  const handleOpenWritePrescription = (appointmentId = null) => {
    if (appointmentId) {
      setSelectedAppointmentId(String(appointmentId));
    } else if (appointments.length > 0) {
      setSelectedAppointmentId(String(appointments[0].id));
    }
    setDoctorNotes('');
    setMedicines('');
    setIsPrescriptionModalOpen(true);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      toast.error('Please select a valid appointment.');
      return;
    }
    if (!doctorNotes.trim() && !medicines.trim()) {
      toast.error('Please enter diagnosis notes or prescribed medicines.');
      return;
    }

    try {
      setSubmittingPrescription(true);
      const payload = {
        appointmentId: Number(selectedAppointmentId),
        doctorNotes,
        medicines
      };
      await appointmentService.addPrescription(payload);
      toast.success('Digital Prescription Issued Successfully!');
      setIsPrescriptionModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Prescription error:', err);
      toast.error(err.response?.data?.message || 'Failed to issue prescription.');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  const handleOpenPatientDatabase = async () => {
    setIsPatientDatabaseOpen(true);
    try {
      setLoadingPatients(true);
      const res = await doctorService.getDoctorPatients();
      setPatientsList(res?.data || res || []);
    } catch (err) {
      console.error('Error fetching patient database:', err);
      toast.error('Failed to load patient database records.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const s = appt.status?.toLowerCase();
    if (activeTab === 'upcoming') return s === 'scheduled' || s === 'booked';
    if (activeTab === 'pending') return s === 'pending';
    if (activeTab === 'completed') return s === 'completed';
    return true;
  });

  const filteredPatients = patientsList.filter(p =>
    (p.name || '').toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    (p.mobileNumber || '').includes(patientSearchQuery)
  );

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
              <button
                onClick={handleToggleAvailability}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3 transition-colors cursor-pointer ${
                  isAvailable ? 'bg-[#ccf2e3] text-[#00835f] hover:bg-[#b5ebd6]' : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffc9c2]'
                }`}
              >
                <CheckCircle size={14} /> {isAvailable ? 'Available for Consults' : 'Currently Offline'}
              </button>
              <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] text-[#171d1c] tracking-tight mb-2">
                Dr. {user?.name?.split(' ')[0] || 'Doctor'}
              </h1>
              <p className="text-[#6d7a77] text-lg font-medium">Here is your clinical overview for today.</p>
            </div>
            <button
              onClick={handleStartQuickConsult}
              className="bg-[#171d1c] hover:bg-[#00685f] text-[#ffffff] px-6 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-[0_8px_20px_rgba(0,104,95,0.25)] hover:-translate-y-0.5 flex items-center gap-2 w-full md:w-auto justify-center"
            >
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
            {/* Main Stat Card - Earnings */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-[#00685f] text-white rounded-[32px] p-8 shadow-[0_12px_24px_rgba(0,104,95,0.2)] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <ActivitySquare size={120} />
              </div>

              <div className="relative z-10">
                <h3 className="text-[#89f5e7] font-bold text-sm uppercase tracking-widest mb-2">Total Earnings</h3>
                <div className="text-5xl font-black font-['Plus_Jakarta_Sans'] mb-4">
                  ₹{stats.totalEarnings >= 1000 ? `${(stats.totalEarnings / 1000).toFixed(1)}k` : stats.totalEarnings}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-sm font-bold">
                  <TrendingUp size={16} /> Verified Revenue
                </div>
              </div>
            </motion.div>

            {/* Pending Requests Alert */}
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

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-[#ffffff] rounded-[32px] border border-[#eaefed] p-8 flex flex-col justify-between">
              <h3 className="font-bold text-[#171d1c] mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleOpenWritePrescription()}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#f0f5f2] hover:bg-[#d3e5f1] hover:text-[#00685f] text-[#3d4947] font-bold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="group-hover:text-[#00685f]" />
                    <span>Write Prescription</span>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleOpenPatientDatabase}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#f0f5f2] hover:bg-[#d3e5f1] hover:text-[#00685f] text-[#3d4947] font-bold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="group-hover:text-[#00685f]" />
                    <span>Patient Database</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>

            {/* Appointments Schedule Overview */}
            <motion.div variants={itemVariants} className="md:col-span-12 bg-[#ffffff] rounded-[32px] border border-[#eaefed] shadow-sm flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-[#eaefed] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#ffffff]">
                <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                  Schedule Overview
                </h2>

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
                              <span className="text-lg font-black leading-none">
                                {(appt.timeSlot || '09:00 AM').split(':')[0]}
                              </span>
                              <span className="text-[10px] font-bold tracking-widest uppercase mt-1">
                                {(appt.timeSlot || 'AM').includes('PM') ? 'PM' : 'AM'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-[#171d1c] text-lg">
                                  {appt.patientName || appt.patient?.name || 'Patient'}
                                </h4>
                                {(appt.consultationMedium === 'VIDEO' || appt.type === 'video') ? (
                                  <span className="bg-[#ccf2e3] text-[#00835f] p-1.5 rounded-lg"><Video size={14}/></span>
                                ) : (
                                  <span className="bg-[#e6d9f2] text-[#6b3399] p-1.5 rounded-lg"><MapPin size={14}/></span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs font-semibold text-[#6d7a77]">
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={14} className="text-[#bcc9c6]" /> {appt.appointmentDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock size={14} className="text-[#bcc9c6]" /> {appt.timeSlot}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-auto">
                            {activeTab === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00685f] hover:bg-[#008378] text-[#ffffff] rounded-xl text-sm font-bold transition-all shadow-sm"
                                >
                                  <CheckCircle size={16} /> Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border border-[#ffb4ab] text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl text-sm font-bold transition-colors"
                                >
                                  <XCircle size={16} /> Decline
                                </button>
                              </>
                            )}

                            {activeTab === 'upcoming' && (
                              <>
                                {appt.bookingId && (
                                  <button
                                    onClick={() => navigate(`/video-call/${appt.bookingId}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#171d1c] hover:bg-[#00685f] text-[#ffffff] rounded-xl text-sm font-bold transition-all shadow-sm hover:-translate-y-0.5"
                                  >
                                    <Video size={16} /> Join Call
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenWritePrescription(appt.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border-2 border-[#eaefed] text-[#171d1c] hover:border-[#00685f] hover:text-[#00685f] rounded-xl text-sm font-bold transition-all"
                                >
                                  <Pill size={16} /> Prescribe
                                </button>
                              </>
                            )}

                            {activeTab === 'completed' && (
                              <div className="flex gap-2 w-full">
                                <button
                                  onClick={() => handleOpenWritePrescription(appt.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] border-2 border-[#eaefed] text-[#171d1c] hover:border-[#00685f] hover:text-[#00685f] rounded-xl text-sm font-bold transition-all"
                                >
                                  <FileText size={16} /> {appt.prescription ? 'Edit Prescription' : 'Add Prescription'}
                                </button>
                                {appt.prescription && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await appointmentService.downloadPrescriptionPdf(appt.id);
                                      } catch (err) {
                                        toast.error('Failed to download prescription PDF');
                                      }
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00685f] hover:bg-[#008378] text-[#ffffff] rounded-xl text-sm font-bold transition-all shadow-sm shrink-0"
                                  >
                                    PDF
                                  </button>
                                )}
                              </div>
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

        {/* WRITE PRESCRIPTION MODAL */}
        <Modal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          title="Issue Digital Prescription"
        >
          <form onSubmit={handleSubmitPrescription} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#171d1c] block mb-1">Select Patient / Appointment *</label>
              <select
                className="w-full p-3 rounded-xl border border-[#bcc9c6] bg-white text-sm focus:border-[#00685f] focus:outline-none"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                required
              >
                <option value="">-- Choose Appointment --</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Booking #{a.bookingId} - {a.patientName} ({a.appointmentDate} at {a.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#171d1c] block mb-1">Diagnosis & Doctor Clinical Notes</label>
              <textarea
                rows="3"
                className="w-full p-3 rounded-xl border border-[#bcc9c6] bg-white text-sm focus:border-[#00685f] focus:outline-none"
                placeholder="Patient presents with mild fever and congestion. Advised rest and fluids."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#171d1c] block mb-1">Prescribed Medicines & Instructions</label>
              <textarea
                rows="4"
                className="w-full p-3 rounded-xl border border-[#bcc9c6] bg-white text-sm font-mono focus:border-[#00685f] focus:outline-none"
                placeholder="1. Paracetamol 500mg - 1 tablet twice daily after meals (5 days)&#10;2. Vitamin C 500mg - 1 tablet daily (7 days)"
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eaefed]">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm font-bold text-[#3d4947]"
                onClick={() => setIsPrescriptionModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPrescription}
                className="px-6 py-2.5 rounded-xl bg-[#00685f] text-white text-sm font-bold hover:bg-[#008378] transition-colors disabled:opacity-50"
              >
                {submittingPrescription ? 'Submitting...' : 'Issue Prescription'}
              </button>
            </div>
          </form>
        </Modal>

        {/* PATIENT DATABASE MODAL */}
        <Modal
          isOpen={isPatientDatabaseOpen}
          onClose={() => setIsPatientDatabaseOpen(false)}
          title="Associated Patient Records Database"
        >
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-[#6d7a77]" />
              <input
                type="text"
                placeholder="Search patient by name, email, or mobile..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#f5faf8] text-sm focus:border-[#00685f] focus:outline-none"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
              />
            </div>

            {loadingPatients ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00685f] mx-auto mb-2"></div>
                <p className="text-xs text-[#6d7a77]">Retrieving verified patient relationship records...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-10 bg-[#f5faf8] rounded-2xl border border-[#eaefed]">
                <User size={36} className="text-[#bcc9c6] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#171d1c]">No Patient Records Found</p>
                <p className="text-xs text-[#6d7a77] mt-1">Only patients who have scheduled appointments with you appear in your clinical database.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredPatients.map((p) => (
                  <div key={p.patientId} className="p-4 rounded-2xl border border-[#eaefed] bg-white hover:border-[#00685f] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[#171d1c] text-base">{p.name}</h4>
                      <span className="bg-[#ccf2e3] text-[#00835f] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {p.totalAppointments} Consultation{p.totalAppointments > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#3d4947] mb-2">
                      <div><strong>Mobile:</strong> {p.mobileNumber}</div>
                      <div><strong>Email:</strong> {p.email || 'N/A'}</div>
                      <div><strong>City:</strong> {p.city || 'N/A'}</div>
                      <div><strong>Blood Group:</strong> {p.bloodGroup || 'O+'}</div>
                    </div>

                    <div className="text-xs bg-[#f5faf8] p-2.5 rounded-xl border border-[#eaefed] text-[#6d7a77]">
                      <strong>Last Appointment:</strong> {p.lastAppointmentDate || 'N/A'} ({p.lastAppointmentStatus || 'COMPLETED'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

      </div>
    </PageTransition>
  );
};
