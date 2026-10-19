import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorAppointments } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, List, TrendingUp } from 'lucide-react';
import '../Dashboard.css';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorAppointments()
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const pending = appointments.filter((a) => a.status === 'pending');
  const todayAppts = appointments.filter((a) => a.date === today && a.status === 'accepted');
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const total = appointments.length;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="dashboard-greeting">
        <div>
          <h1>Doctor Dashboard 👨‍⚕️</h1>
          <p>Welcome back, Dr. {user?.name?.split(' ').slice(-1)[0]}</p>
        </div>
        <Link to="/doctor/requests" className="btn btn-primary">
          View Requests {pending.length > 0 && <span className="req-badge">{pending.length}</span>}
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-amber">
          <div className="stat-icon"><List size={22} /></div>
          <div><div className="stat-val">{pending.length}</div><div className="stat-lbl">Pending</div></div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon"><Calendar size={22} /></div>
          <div><div className="stat-val">{todayAppts.length}</div><div className="stat-lbl">Today</div></div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon"><CheckCircle size={22} /></div>
          <div><div className="stat-val">{completed}</div><div className="stat-lbl">Completed</div></div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon"><TrendingUp size={22} /></div>
          <div><div className="stat-val">{total}</div><div className="stat-lbl">Total</div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Today's Schedule */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Today's Schedule</h3>
            <Link to="/doctor/requests" className="view-all">Manage →</Link>
          </div>
          {todayAppts.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Calendar size={40} />
              <h3>No confirmed appointments today</h3>
            </div>
          ) : (
            <div className="appt-list">
              {todayAppts.map((a) => (
                <div key={a._id} className="appt-item">
                  <div className="appt-avatar">{a.patientId?.name?.charAt(0)}</div>
                  <div className="appt-info">
                    <p className="appt-doctor">{a.patientId?.name}</p>
                    <p className="appt-meta"><Clock size={12} /> {a.time}</p>
                  </div>
                  <span className="badge badge-accepted">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Pending Requests</h3>
            <Link to="/doctor/requests" className="view-all">View all →</Link>
          </div>
          {pending.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <CheckCircle size={40} />
              <h3>No pending requests</h3>
            </div>
          ) : (
            <div className="appt-list">
              {pending.slice(0, 4).map((a) => (
                <div key={a._id} className="appt-item">
                  <div className="appt-avatar">{a.patientId?.name?.charAt(0)}</div>
                  <div className="appt-info">
                    <p className="appt-doctor">{a.patientId?.name}</p>
                    <p className="appt-meta"><Calendar size={12} /> {a.date} <Clock size={12} /> {a.time}</p>
                  </div>
                  <span className="badge badge-pending">pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
