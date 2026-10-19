import React, { useState, useEffect } from 'react';
import { getAdminMetrics, getAdminDoctors, getAdminPatients, approveDoctor, deleteUser } from '../../api';
import { toast } from 'react-hot-toast';
import { Users, Stethoscope, Activity, CheckCircle, Trash2, Calendar } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, dRes, pRes] = await Promise.all([
        getAdminMetrics(),
        getAdminDoctors(),
        getAdminPatients()
      ]);
      setMetrics(mRes.data);
      setDoctors(dRes.data);
      setPatients(pRes.data);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDoctor(id);
      toast.success('Doctor approved successfully!');
      fetchData(); // Refresh list
    } catch (err) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleDelete = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) return;
    
    try {
      await deleteUser(id);
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully.`);
      fetchData();
    } catch (err) {
      toast.error(`Failed to delete ${role}`);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper admin-wrapper">
      <div className="section-header">
        <h2>Admin Dashboard</h2>
        <p>Manage users, view metrics, and approve doctors.</p>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>Doctors ({doctors.length})</button>
        <button className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>Patients ({patients.length})</button>
      </div>

      {activeTab === 'overview' && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon"><Users size={24} /></div>
            <div className="metric-info">
              <h3>{metrics?.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon highlight"><Stethoscope size={24} /></div>
            <div className="metric-info">
              <h3>{metrics?.totalDoctors || 0}</h3>
              <p>Total Doctors</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon warning">
              {metrics?.unapprovedDoctors > 0 && <span className="ping-badge" />}
              <CheckCircle size={24} />
            </div>
            <div className="metric-info">
              <h3>{metrics?.unapprovedDoctors || 0}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Calendar size={24} /></div>
            <div className="metric-info">
              <h3>{metrics?.totalAppointments || 0}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="card list-card">
          <h3 className="card-title">Manage Doctors</h3>
          {doctors.length === 0 ? (
            <p className="empty-msg">No doctors registered yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td>{d.email}</td>
                      <td>{d.specialization}</td>
                      <td>
                        {d.isApproved ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          {!d.isApproved && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleApprove(d._id)}>
                              Approve
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm delete-btn" onClick={() => handleDelete(d._id, 'doctor')}>
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="card list-card">
          <h3 className="card-title">Manage Patients</h3>
          {patients.length === 0 ? (
            <p className="empty-msg">No patients registered yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-outline btn-sm delete-btn" onClick={() => handleDelete(p._id, 'patient')}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
