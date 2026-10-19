import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctor, bookAppointment } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
import {
  Stethoscope, MapPin, Clock, IndianRupee, Star, ArrowLeft,
  Calendar, CheckCircle, User, Award, Phone
} from 'lucide-react';
import './DoctorDetail.css';

function StarRating({ rating, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : 'var(--text-muted)', fontSize: '18px' }}>★</span>
        ))}
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {rating ? rating.toFixed(1) : '0.0'} ({total || 0} reviews)
      </span>
    </div>
  );
}

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getDoctor(id)
      .then((res) => setDoctor(res.data))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Get unique dates from available, not-booked slots
  const availableDates = doctor
    ? [...new Set(
        doctor.availableSlots
          .filter((s) => !s.isBooked && isAfter(parseISO(s.date), startOfToday()))
          .map((s) => s.date)
      )].sort()
    : [];

  const slotsForDate = selectedDate
    ? doctor?.availableSlots.filter((s) => s.date === selectedDate && !s.isBooked)
    : [];

  const handleBook = async () => {
    if (!user) { toast.error('Please login to book an appointment'); navigate('/login'); return; }
    if (user.role === 'doctor') { toast.error('Doctors cannot book appointments'); return; }
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }

    setBooking(true);
    try {
      await bookAppointment({
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedSlot.time,
        reason,
      });
      toast.success('Appointment booked! Awaiting doctor confirmation. 🎉');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!doctor) return <div className="page-wrapper"><p>Doctor not found</p></div>;

  return (
    <div className="page-wrapper">
      <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="doctor-detail-layout">
        {/* Left: Profile */}
        <div className="doctor-profile-col">
          <div className="card doctor-profile-card">
            <div className="profile-hero">
              <div className="profile-avatar">{doctor.name.charAt(0).toUpperCase()}</div>
              <div>
                <h1>{doctor.name}</h1>
                <div className="profile-spec"><Stethoscope size={14} /> {doctor.specialization}</div>
                <StarRating rating={doctor.rating} total={doctor.totalRatings} />
              </div>
            </div>

            <div className="profile-stats">
              <div className="pstat"><Award size={18} /><span>{doctor.experience || 0}+</span><label>Years Exp.</label></div>
              <div className="pstat"><User size={18} /><span>{doctor.totalRatings || 0}</span><label>Patients</label></div>
              <div className="pstat"><Star size={18} /><span>{doctor.rating ? doctor.rating.toFixed(1) : '—'}</span><label>Rating</label></div>
            </div>

            <div className="profile-details">
              {doctor.hospital && (
                <div className="detail-row"><MapPin size={15} /><span>{doctor.hospital}</span></div>
              )}
              {doctor.phone && (
                <div className="detail-row"><Phone size={15} /><span>{doctor.phone}</span></div>
              )}
              <div className="detail-row"><IndianRupee size={15} /><span>Consultation Fee: ₹{doctor.consultationFee || 500}</span></div>
            </div>

            {doctor.bio && (
              <div className="profile-bio">
                <h4>About</h4>
                <p>{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking */}
        <div className="booking-col">
          <div className="card">
            <h2 className="booking-title"><Calendar size={20} /> Book Appointment</h2>

            {availableDates.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Clock size={48} />
                <h3>No Available Slots</h3>
                <p>This doctor hasn't added available slots yet.</p>
              </div>
            ) : (
              <>
                {/* Date Selection */}
                <div className="booking-section">
                  <h3 className="booking-sub">Select Date</h3>
                  <div className="date-grid">
                    {availableDates.map((date) => {
                      const d = parseISO(date);
                      return (
                        <button
                          key={date}
                          className={`date-btn ${selectedDate === date ? 'selected' : ''}`}
                          onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        >
                          <span className="date-day">{format(d, 'EEE')}</span>
                          <span className="date-num">{format(d, 'd')}</span>
                          <span className="date-mon">{format(d, 'MMM')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="booking-section">
                    <h3 className="booking-sub">Select Time</h3>
                    {slotsForDate.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No slots for this date</p>
                    ) : (
                      <div className="slots-grid">
                        {slotsForDate.map((slot) => (
                          <button
                            key={slot._id}
                            className={`slot-btn ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <Clock size={13} /> {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reason */}
                {selectedSlot && (
                  <div className="booking-section">
                    <h3 className="booking-sub">Reason for Visit</h3>
                    <textarea
                      className="form-input"
                      placeholder="Describe your symptoms or reason for visit..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Booking Summary */}
                {selectedSlot && (
                  <div className="booking-summary">
                    <div className="summary-row">
                      <span>Date</span>
                      <span>{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="summary-row">
                      <span>Time</span>
                      <span>{selectedSlot.time}</span>
                    </div>
                    <div className="summary-row">
                      <span>Doctor</span>
                      <span>{doctor.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Fee</span>
                      <span>₹{doctor.consultationFee || 500}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleBook}
                  disabled={!selectedSlot || booking}
                  style={{ marginTop: '1rem' }}
                >
                  {booking ? 'Booking...' : <><CheckCircle size={18} /> Confirm Appointment</>}
                </button>

                {!user && (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Please <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}>login</button> to book
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
