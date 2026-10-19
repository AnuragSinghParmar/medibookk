import React, { useState, useEffect } from 'react';
import { getMe, updateMe } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Save } from 'lucide-react';
import './Profile.css';

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateMe(form);
      setUser((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>My Profile</h2>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="card profile-avatar-card">
            <div className="profile-big-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <h3>{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <span className="badge badge-accepted">{user?.role}</span>
          </div>
        </div>

        <div className="profile-form-col">
          <div className="card">
            <h3 className="profile-section-title">Personal Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required className="form-input input-padded"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email" value={user?.email || ''}
                    disabled className="form-input input-padded"
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  />
                </div>
                <span className="form-error" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input input-padded"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
