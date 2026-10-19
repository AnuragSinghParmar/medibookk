import React, { useState, useEffect } from 'react';
import { getDoctorAppointments, updateAppointmentStatus } from '../../api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, XCircle, X, User } from 'lucide-react';
import './DoctorRequests.css';

const TABS = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled'];

export default function DoctorRequests() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetch = async () => {
    try {
      const { data } = await getDoctorAppointments();
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id, status, extra = {}) => {
    try {
      await updateAppointmentStatus(id, { status, ...extra });
      toast.success(`Appointment ${status}!`);
      setRejectModal(null);
      setRejectReason('');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const filtered = appointments.filter((a) =>
    activeTab === 'All' ? true : a.status === activeTab.toLowerCase()
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>Appointment Requests</h2>
        <p>Review and manage patient appointment requests</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
            {t !== 'All' && (
              <span className="tab-count">{appointments.filter((a) => a.status === t.toLowerCase()).length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={60} />
          <h3>No {activeTab.toLowerCase()} appointments</h3>
        </div>
      ) : (
        <div className="requests-list">
          {filtered.map((appt) => (
            <RequestCard
              key={appt._id}
              appt={appt}
              onAccept={() => handleStatus(appt._id, 'accepted')}
              onComplete={() => handleStatus(appt._id, 'completed')}
              onReject={() => setRejectModal(appt)}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Appointment</h3>
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Patient: <strong>{rejectModal.patientId?.name}</strong> — {rejectModal.date} at {rejectModal.time}
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Rejection</label>
              <textarea
                className="form-input"
                placeholder="Please provide a reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">Cancel</button>
              <button
                onClick={() => handleStatus(rejectModal._id, 'rejected', { rejectionReason: rejectReason })}
                className="btn btn-danger"
              >
                Reject Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ appt, onAccept, onComplete, onReject }) {
  const isPending = appt.status === 'pending';
  const isAccepted = appt.status === 'accepted';

  return (
    <div className="request-card">
      <div className="request-header">
        <div className="patient-info">
          <div className="patient-avatar">{appt.patientId?.name?.charAt(0)}</div>
          <div>
            <h3>{appt.patientId?.name}</h3>
            <p className="patient-contact">{appt.patientId?.email}</p>
            {appt.patientId?.phone && <p className="patient-contact">{appt.patientId.phone}</p>}
          </div>
        </div>
        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
      </div>

      <div className="request-details">
        <div className="req-detail"><Calendar size={14} /><span>{appt.date}</span></div>
        <div className="req-detail"><Clock size={14} /><span>{appt.time}</span></div>
      </div>

      {appt.reason && (
        <div className="req-reason">
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Reason: </span>{appt.reason}
        </div>
      )}

      {appt.rejectionReason && (
        <div className="req-rejection">Rejected: {appt.rejectionReason}</div>
      )}

      {(isPending || isAccepted) && (
        <div className="request-actions">
          {isPending && (
            <>
              <button onClick={onAccept} className="btn btn-success btn-sm">
                <CheckCircle size={14} /> Accept
              </button>
              <button onClick={onReject} className="btn btn-danger btn-sm">
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {isAccepted && (
            <button onClick={onComplete} className="btn btn-primary btn-sm">
              <CheckCircle size={14} /> Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
