import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { specialityService } from '../services/specialityService';
import { Search, MapPin, CheckCircle, Star, Filter, Calendar, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/common/PageTransition';

export const DoctorSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('name') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialityId') || '');
  const [city, setCity] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    specialityService.getAllSpecialities()
      .then((data) => setSpecialities(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    const params = {};
    if (selectedSpecialty) params.specialityId = selectedSpecialty;
    if (city) params.city = city;
    if (searchQuery) params.name = searchQuery;
    if (availableOnly) params.isAvailable = true;

    doctorService.searchDoctors(params)
      .then((data) => setDoctors(data))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, availableOnly]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <PageTransition>
      <div className="bg-[#f5faf8] min-h-screen pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d3e5f1] text-[#00685f] text-xs font-semibold uppercase tracking-wider mb-2">
                <CheckCircle size={14} /> Verified Directory
              </div>
              <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">Find & Book Medical Experts</h2>
              <p className="text-sm text-[#3d4947] mt-2 max-w-xl leading-relaxed">Search real-time slot availability for video teleconsultations and in-clinic visits.</p>
            </div>
          </div>

          {/* Specialty Filter Chips */}
          {specialities.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
              <button
                onClick={() => setSelectedSpecialty('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  selectedSpecialty === ''
                    ? 'bg-[#00685f] text-[#ffffff] border-[#00685f]'
                    : 'bg-[#ffffff] text-[#3d4947] hover:border-[#00685f] border-[#eaefed]'
                }`}
              >
                All Specialities
              </button>
              {specialities.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(String(spec.id))}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    String(selectedSpecialty) === String(spec.id)
                      ? 'bg-[#00685f] text-[#ffffff] border-[#00685f]'
                      : 'bg-[#ffffff] text-[#3d4947] hover:border-[#00685f] border-[#eaefed]'
                  }`}
                >
                  {spec.name}
                </button>
              ))}
            </div>
          )}

          {/* Filter Bar Form */}
          <form onSubmit={handleFilterSubmit} className="bg-[#ffffff] border border-[#eaefed] shadow-sm mb-8 p-6 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-[#171d1c] uppercase tracking-wide block mb-1.5">Speciality</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#f5faf8] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none transition-all"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">All Specialities</option>
                  {specialities.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171d1c] uppercase tracking-wide block mb-1.5">City / Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#f5faf8] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none transition-all"
                  placeholder="Search city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171d1c] uppercase tracking-wide block mb-1.5">Doctor Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#f5faf8] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none transition-all"
                  placeholder="Doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between gap-4 h-full pt-6 md:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#3d4947]">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
                  />
                  <span>Available Today</span>
                </label>

                <button type="submit" className="bg-[#00685f] hover:bg-[#008378] text-[#ffffff] px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
          </form>

          {/* Doctor List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00685f] mx-auto mb-4"></div>
              <p className="text-[#6d7a77] text-sm font-medium">Retrieving verified doctor schedules...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-[#ffffff] border border-[#eaefed] shadow-sm text-center py-20 rounded-3xl">
              <div className="w-16 h-16 bg-[#f0f5f2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#bcc9c6]">
                <Stethoscope size={32} />
              </div>
              <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c]">No Doctors Matched Your Criteria</h3>
              <p className="text-sm text-[#6d7a77] mt-2">Try clearing your search query or selecting another speciality.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              {doctors.map((doc) => (
                <motion.div variants={itemVariants} key={doc.id}>
                  <div className="bg-[#ffffff] p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center border border-[#eaefed] hover:border-[#bcc9c6] hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(`/doctors/${doc.id}`)}>
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#eaefed]">
                      <img
                        src={doc.profilePictureUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80';
                        }}
                        alt={doc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${doc.availability ? 'bg-[#00835f]' : 'bg-[#ba1a1a]'}`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] group-hover:text-[#00685f] transition-colors">{doc.name}</h3>
                        {doc.degree && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f0f5f2] text-[#00685f] text-xs font-bold uppercase">
                            {doc.degree}
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.availability ? 'bg-[#ccf2e3] text-[#00835f]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
                          {doc.availability ? 'Available Today' : 'Offline'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-[#00685f] mb-2 flex items-center gap-2">
                        {doc.specialization} <span className="w-1 h-1 rounded-full bg-[#bcc9c6]"></span> <span className="text-xs text-[#6d7a77]">{doc.experience || 0} Yrs Exp.</span>
                      </p>

                      <p className="text-sm text-[#3d4947] flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#6d7a77] shrink-0" />
                        {doc.clinicName || doc.workingOn || doc.fullAddress || 'CareConnect Partner Clinic'} {doc.city ? `(${doc.city})` : ''}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-[#eaefed] pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-2xl font-bold text-[#171d1c]">₹{doc.fees}</span>
                        <span className="block text-xs text-[#6d7a77] font-medium">Per Consultation</span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${doc.id}`); }}
                        className="bg-[#00685f] hover:bg-[#008378] text-[#ffffff] w-full md:w-auto px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors shadow-sm"
                      >
                        <Calendar size={16} /> Book Consultation
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
