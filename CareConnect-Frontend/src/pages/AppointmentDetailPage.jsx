import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { FileText, Calendar, Clock, Video, CheckCircle, ArrowLeft } from 'lucide-react';

export const AppointmentDetailPage = () => {
  const { bookingId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentService.getAppointmentByBookingId(bookingId)
      .then((data) => setAppointment(data))
      .catch(() => setError('Appointment record not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>Loading appointment details...</div>;
  if (error || !appointment) return <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>{error || 'Appointment not found'}</div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '30px', borderLeft: '6px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Booking Confirmation</span>
              <h2 style={{ fontSize: '24px', marginTop: '4px' }}>Booking #{appointment.bookingId}</h2>
            </div>
            <span className={`badge badge-${(appointment.status || 'booked').toLowerCase()}`} style={{ padding: '6px 16px', fontSize: '14px' }}>
              {appointment.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Doctor</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)' }}>{appointment.doctorName}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{appointment.doctorSpecialization}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Patient</span>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{appointment.patientName}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Date & Time Slot</span>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{appointment.appointmentDate}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{appointment.timeSlot}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Medium & Fee</span>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{appointment.consultationMedium}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>₹{appointment.amountPaid} Paid ({appointment.paymentMethod})</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to={`/video-call/${appointment.bookingId}`} className="btn btn-primary">
              <Video size={16} /> Enter Video Call Room
            </Link>
          </div>
        </div>

        {/* Digital Prescription Section */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="var(--primary)" /> Digital Prescription Records
          </h3>

          {!appointment.prescription ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No digital prescription has been issued for this appointment yet.
            </p>
          ) : (
            <div style={{ background: '#f0f7ff', border: '1px solid #bae0ff', padding: '20px', borderRadius: '12px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--primary-dark)', marginBottom: '6px' }}>Doctor Diagnosis & Notes</h4>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#1e293b' }}>
                  {appointment.prescription.doctorNotes || 'No specific diagnostic notes recorded.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #bae0ff', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--primary-dark)', marginBottom: '6px' }}>Prescribed Medicines & Dosage</h4>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-line' }}>
                  {appointment.prescription.medicines || 'No medicines prescribed.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
