import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { CheckCircle, Calendar, Clock, MapPin, Award, Video, UserCheck, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorDetailPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableSlots] = useState([
    '09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationMedium, setConsultationMedium] = useState('VIDEO');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorDetails();
    fetchReviews();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const docData = await doctorService.getDoctorById(doctorId);
      setDoctor(docData);
    } catch (err) {
      console.error(err);
      setError('Doctor record not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const revRes = await reviewService.getDoctorReviews(doctorId);
      if (revRes && revRes.data) {
        setReviews(revRes.data);
      }
    } catch (err) {
      console.error('Error fetching doctor reviews', err);
    }
  };

  const handleBookClick = () => {
    if (!user) {
      toast.error('Please log in to book an appointment.');
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select a time slot first.');
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
        consultationMedium,
        paymentMethod
      };

      const res = await appointmentService.createAppointment(payload);
      setIsModalOpen(false);
      toast.success('Appointment booked successfully!');
      const bookingId = res.data?.bookingId || res.bookingId;
      navigate(`/appointments/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Slot already booked or invalid request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>Loading doctor details...</div>;
  if (error && !doctor) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>{error}</div>;
  if (!doctor) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>Doctor not found</div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="card" style={{ padding: '32px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-light)', flexShrink: 0 }}>
              <img
                src={doctor.profilePictureUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80';
                }}
                alt={doctor.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <span className={`badge ${doctor.availability ? 'badge-available' : 'badge-unavailable'}`} style={{ marginBottom: '8px' }}>
                {doctor.availability ? 'Available for Consultation' : 'Currently Unavailable'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '28px', color: 'var(--dark-bg)', margin: 0 }}>{doctor.name}</h2>
                {doctor.degree && (
                  <span style={{ background: '#e6f4f1', color: '#00685f', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                    {doctor.degree}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
                {doctor.specialization} &bull; {doctor.experience || 0} Years Experience
              </p>

              {doctor.licenseNumber && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Medical Reg. / License No: <strong>{doctor.licenseNumber}</strong>
                </p>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {doctor.clinicName || doctor.workingOn || doctor.fullAddress || 'CareConnect Clinic'} {doctor.city ? `(${doctor.city})` : ''}
              </p>

              {doctor.languages && (
                <p style={{ fontSize: '13px', color: '#3d4947', marginBottom: '16px' }}>
                  <strong>Languages Spoken:</strong> {doctor.languages}
                </p>
              )}

              {doctor.bio && (
                <div style={{ background: '#f5faf8', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #eaefed', fontSize: '14px', color: '#3d4947' }}>
                  <strong>About Doctor:</strong> {doctor.bio}
                </div>
              )}

              <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '14px 20px', borderRadius: '12px', width: 'fit-content' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark-bg)' }}>₹{doctor.fees || 500}</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Patient Rating</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', display: 'flex', items: 'center', gap: '4px' }}>
                    <Star size={16} fill="#d97706" /> {doctor.rating || '4.9'} ({doctor.reviewCount || reviews.length} reviews)
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Practicing At</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{doctor.clinicName || doctor.workingOn || 'CareConnect Medical Center'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Slot Scheduler */}
        <div className="card" style={{ padding: '32px', marginBottom: '30px' }}>
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

        {/* Patient Reviews Section */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={22} color="var(--primary)" /> Patient Reviews & Ratings ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              No reviews submitted for this doctor yet. Patients can leave a review after a completed consultation.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #eaefed' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#171d1c' }}>{rev.patientName}</span>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={12} fill="#b45309" /> {rev.rating}★
                    </span>
                  </div>
                  {rev.comment && <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>"{rev.comment}"</p>}
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
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
              {bookingLoading ? 'Processing Payment...' : `Confirm & Pay ₹${doctor.fees || 500}`}
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
            <p style={{ marginBottom: '0' }}><strong>Amount Payable:</strong> ₹{doctor.fees || 500}</p>
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

