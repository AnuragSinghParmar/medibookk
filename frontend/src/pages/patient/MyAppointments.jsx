import React, { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment, rescheduleAppointment, rateAppointment } from '../../api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, X, RefreshCw, Star } from 'lucide-react';
import './Appointments.css';

const TABS = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'];

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [cancelId, setCancelId] = useState(null);
  const [ratingAppt, setRatingAppt] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await getMyAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const filtered = appointments.filter((a) => {
    if (activeTab === 'All') return true;
    return a.status === activeTab.toLowerCase();
  });

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      setCancelId(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleRate = async () => {
    try {
      await rateAppointment(ratingAppt._id, { rating, review });
      toast.success('Rating submitted! ⭐');
      setRatingAppt(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>My Appointments</h2>
        <p>Track and manage all your appointment bookings</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            {t !== 'All' && (
              <span className="tab-count">
                {appointments.filter((a) => a.status === t.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={60} />
          <h3>No {activeTab.toLowerCase()} appointments</h3>
          <p>Your appointments will appear here</p>
        </div>
      ) : (
        <div className="appt-cards">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appt={appt}
              onCancel={() => setCancelId(appt._id)}
              onRate={() => setRatingAppt(appt)}
              onReschedule={() => setRescheduleAppt(appt)}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button onClick={() => setCancelId(null)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setCancelId(null)} className="btn btn-ghost">Keep it</button>
              <button onClick={() => handleCancel(cancelId)} className="btn btn-danger">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingAppt && (
        <div className="modal-overlay" onClick={() => setRatingAppt(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate Dr. {ratingAppt.doctorId?.name}</h3>
              <button onClick={() => setRatingAppt(null)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  className={`star-btn ${s <= rating ? 'active' : ''}`}
                  onClick={() => setRating(s)}
                >
                  <Star size={28} fill={s <= rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Review (optional)</label>
              <textarea
                className="form-input"
                placeholder="Share your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
              />
            </div>
            <button onClick={handleRate} className="btn btn-primary btn-full">Submit Rating</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt, onCancel, onRate, onReschedule }) {
  const canCancel = ['pending', 'accepted'].includes(appt.status);
  const canRate = appt.status === 'completed' && !appt.isRated;

  return (
    <div className="appt-card">
      <div className="appt-card-header">
        <div className="appt-doc-info">
          <div className="appt-avatar">{appt.doctorId?.name?.charAt(0)}</div>
          <div>
            <h3>{appt.doctorId?.name}</h3>
            <p className="appt-spec">{appt.doctorSpecialization}</p>
          </div>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div className="appt-details">
        <div className="appt-detail-item"><Calendar size={14} /><span>{appt.date}</span></div>
        <div className="appt-detail-item"><Clock size={14} /><span>{appt.time}</span></div>
      </div>

      {appt.reason && (
        <div className="appt-reason">
          <span className="reason-label">Reason:</span> {appt.reason}
        </div>
      )}

      {appt.rejectionReason && (
        <div className="appt-rejection">
          <span className="reason-label">Rejection reason:</span> {appt.rejectionReason}
        </div>
      )}

      {appt.isRated && (
        <div className="appt-rated">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>You rated this appointment {appt.rating}/5</span>
        </div>
      )}

      <div className="appt-actions">
        {canCancel && (
          <>
            <button onClick={onCancel} className="btn btn-danger btn-sm">
              <X size={14} /> Cancel
            </button>
            <button onClick={onReschedule} className="btn btn-ghost btn-sm">
              <RefreshCw size={14} /> Reschedule
            </button>
          </>
        )}
        {canRate && (
          <button onClick={onRate} className="btn btn-accent btn-sm">
            <Star size={14} /> Rate Doctor
          </button>
        )}
      </div>
    </div>
  );
}
