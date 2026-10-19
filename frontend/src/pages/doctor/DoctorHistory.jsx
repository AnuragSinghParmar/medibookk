import React, { useState, useEffect } from 'react';
import { getDoctorAppointments } from '../../api';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import '../Dashboard.css';

const TABS = ['All', 'Completed', 'Rejected', 'Cancelled'];

export default function DoctorHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    getDoctorAppointments()
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const historicalStatuses = ['completed', 'rejected', 'cancelled'];
  const history = appointments.filter((a) => historicalStatuses.includes(a.status));

  const filtered = history.filter((a) =>
    activeTab === 'All' ? true : a.status === activeTab.toLowerCase()
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>Appointment History</h2>
        <p>View all completed and past appointments</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t} <span className="tab-count">{t === 'All' ? history.length : history.filter((a) => a.status === t.toLowerCase()).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={60} />
          <h3>No history yet</h3>
          <p>Completed appointments will appear here</p>
        </div>
      ) : (
        <div className="appt-cards-history">
          {filtered.map((appt) => (
            <div key={appt._id} className="appt-item" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div className="appt-avatar">{appt.patientId?.name?.charAt(0)}</div>
              <div className="appt-info">
                <p className="appt-doctor">{appt.patientId?.name}</p>
                <p className="appt-meta">
                  <Calendar size={12} /> {appt.date} &nbsp; <Clock size={12} /> {appt.time}
                </p>
                {appt.reason && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{appt.reason}</p>}
                {appt.rating && (
                  <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '4px' }}>
                    {'★'.repeat(appt.rating)} {appt.review && `— "${appt.review}"`}
                  </p>
                )}
              </div>
              <span className={`badge badge-${appt.status}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
