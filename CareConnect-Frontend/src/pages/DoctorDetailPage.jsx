import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Calendar, Clock, MapPin, Award, Video, UserCheck } from 'lucide-react';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState('VIDEO_CALL');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctorAndSlots();
  }, [id]);

  const fetchDoctorAndSlots = async () => {
    setLoading(true);
    try {
      const docData = await doctorService.getDoctorById(id);
      setDoctor(docData);

      const slotData = await doctorService.getAvailableSlots(id);
      setSlots(slotData);
      if (slotData.length > 0) setSelectedSlot(slotData[0]);
    } catch (err) {
      console.error(err);
      setDoctor({
        id: id,
        name: 'Dr. Sarah Jenkins',
        specialityName: 'Neurologist',
        experienceYears: 14,
        consultationFee: 150,
        city: 'Downtown Medical Center',
        hospitalName: 'St. Jude Neurological Institute',
        bio: 'Specializes in Cognitive Disorders and Neurorehabilitation. Over 14 years of clinical practice.',
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
        isAvailable: true
      });

      setSlots([
        { id: 101, startTime: '2026-08-14T09:00:00', endTime: '2026-08-14T09:30:00', isBooked: false },
        { id: 102, startTime: '2026-08-14T10:30:00', endTime: '2026-08-14T11:00:00', isBooked: false },
        { id: 103, startTime: '2026-08-14T14:00:00', endTime: '2026-08-14T14:30:00', isBooked: false },
        { id: 104, startTime: '2026-08-14T16:30:00', endTime: '2026-08-14T17:00:00', isBooked: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      alert('Please select a time slot first');
      return;
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setError('');
    try {
      const payload = {
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        consultationMedium: consultationMedium,
        paymentMethod: paymentMethod
      };

      const res = await appointmentService.createAppointment(payload);
      setIsModalOpen(false);
      navigate(`/appointments/${res.data.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Slot already booked or invalid request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>Loading doctor details...</div>;
  if (!doctor) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>Doctor not found</div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="card" style={{ padding: '32px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-light)', flexShrink: 0 }}>
              <img src={doctor.profilePictureUrl || '/images/doctor.png'} alt={doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <span className={`badge ${doctor.availability ? 'badge-available' : 'badge-unavailable'}`} style={{ marginBottom: '8px' }}>
                {doctor.availability ? 'Available for Consultation' : 'Currently Unavailable'}
              </span>

              <h2 style={{ fontSize: '28px', color: 'var(--dark-bg)', marginBottom: '6px' }}>{doctor.name}</h2>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>
                {doctor.specialization} &bull; {doctor.experience} Years Experience
              </p>

              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {doctor.fullAddress || doctor.workingOn || 'City Medical Center'}
              </p>

              <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '14px 20px', borderRadius: '12px', width: 'fit-content' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark-bg)' }}>₹{doctor.fees}</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Practicing At</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{doctor.workingOn || 'Hospital'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Slot Scheduler */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={22} color="var(--primary)" /> Select Appointment Date & Time Slot
          </h3>

          <div className="form-group" style={{ maxWidth: '300px', marginBottom: '24px' }}>
            <label>Select Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Available Time Slots</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '30px' }}>
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`btn ${selectedSlot === slot ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '10px', fontSize: '14px', borderRadius: '10px' }}
                onClick={() => setSelectedSlot(slot)}
              >
                <Clock size={14} /> {slot}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <div>
              {selectedSlot ? (
                <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '15px' }}>
                  Selected: {selectedDate} at {selectedSlot}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please pick a slot to continue</span>
              )}
            </div>

            <button
              onClick={handleBookClick}
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: '16px' }}
              disabled={!selectedSlot}
            >
              Proceed to Booking &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Review & Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review & Confirm Appointment"
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirmBooking} disabled={bookingLoading}>
              {bookingLoading ? 'Processing Payment...' : `Confirm & Pay ₹${doctor.fees}`}
            </button>
          </>
        )}
      >
        <div>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <p style={{ marginBottom: '8px' }}><strong>Doctor:</strong> {doctor.name}</p>
            <p style={{ marginBottom: '8px' }}><strong>Speciality:</strong> {doctor.specialization}</p>
            <p style={{ marginBottom: '8px' }}><strong>Date:</strong> {selectedDate}</p>
            <p style={{ marginBottom: '8px' }}><strong>Time Slot:</strong> {selectedSlot}</p>
            <p style={{ marginBottom: '0' }}><strong>Amount Payable:</strong> ₹{doctor.fees}</p>
          </div>

          <div className="form-group">
            <label>Consultation Medium</label>
            <select className="form-control" value={consultationMedium} onChange={(e) => setConsultationMedium(e.target.value)}>
              <option value="VIDEO">HD Video Call</option>
              <option value="IN_PERSON">In-Person Clinic Visit</option>
              <option value="CHAT">Chat Consultation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Payment Method</label>
            <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="CARD">Credit / Debit Card</option>
              <option value="RAZORPAY">RazorPay Gateway</option>
              <option value="UPI">UPI / Google Pay / PhonePe</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
