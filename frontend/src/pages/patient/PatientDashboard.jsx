import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments, getDoctors } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Stethoscope, ArrowRight, TrendingUp, User, CheckCircle } from 'lucide-react';
import '../Dashboard.css';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAppointments(), getDoctors()])
      .then(([appts, docs]) => {
        setAppointments(appts.data);
        setDoctors(docs.data.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter((a) => ['pending', 'accepted'].includes(a.status));
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div>
          <h1>Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's an overview of your health appointments</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">
          <Stethoscope size={16} /> Find a Doctor
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-blue">
          <div className="stat-icon"><Calendar size={22} /></div>
          <div>
            <div className="stat-val">{upcoming.length}</div>
            <div className="stat-lbl">Upcoming</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon"><CheckCircle size={22} /></div>
          <div>
            <div className="stat-val">{completed}</div>
            <div className="stat-lbl">Completed</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-val">{appointments.length}</div>
            <div className="stat-lbl">Total</div>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon"><User size={22} /></div>
          <div>
            <div className="stat-val">{cancelled}</div>
            <div className="stat-lbl">Cancelled</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Upcoming Appointments</h3>
            <Link to="/patient/appointments" className="view-all">View all <ArrowRight size={14} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No upcoming appointments</h3>
              <p>Book your first appointment</p>
              <Link to="/doctors" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Find Doctor
              </Link>
            </div>
          ) : (
            <div className="appt-list">
              {upcoming.slice(0, 3).map((a) => (
                <AppointmentItem key={a._id} appt={a} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Doctors */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Explore Doctors</h3>
            <Link to="/doctors" className="view-all">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="doctor-mini-list">
            {doctors.map((doc) => (
              <Link to={`/doctors/${doc._id}`} key={doc._id} className="doctor-mini">
                <div className="dm-avatar">{doc.name.charAt(0).toUpperCase()}</div>
                <div className="dm-info">
                  <p className="dm-name">{doc.name}</p>
                  <p className="dm-spec">{doc.specialization}</p>
                </div>
                <div className="dm-fee">₹{doc.consultationFee || 500}</div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>
            ))}
            {doctors.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No doctors registered yet</p>}
          </div>
        </div>
      </div>

      {/* Recent History */}
      {appointments.filter(a => ['completed','cancelled','rejected'].includes(a.status)).length > 0 && (
        <div className="dash-section" style={{ marginTop: '1.5rem' }}>
          <div className="dash-section-header">
            <h3>Recent History</h3>
            <Link to="/patient/appointments" className="view-all">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="appt-list">
            {appointments
              .filter(a => ['completed','cancelled','rejected'].includes(a.status))
              .slice(0, 3)
              .map((a) => <AppointmentItem key={a._id} appt={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentItem({ appt }) {
  return (
    <div className="appt-item">
      <div className="appt-avatar">{appt.doctorId?.name?.charAt(0).toUpperCase() || 'D'}</div>
      <div className="appt-info">
        <p className="appt-doctor">{appt.doctorId?.name}</p>
        <p className="appt-meta">
          <Calendar size={12} /> {appt.date} &nbsp; <Clock size={12} /> {appt.time}
        </p>
      </div>
      <span className={`badge badge-${appt.status}`}>{appt.status}</span>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
