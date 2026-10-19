import React, { useState, useEffect } from 'react';
import { getMe, updateMe } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Save, Stethoscope, Building, IndianRupee } from 'lucide-react';
import '../patient/Profile.css';

export default function DoctorProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', specialization: '', experience: '',
    bio: '', hospital: '', address: '', consultationFee: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe().then(({ data }) => {
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        specialization: data.doctorProfile?.specialization || '',
        experience: data.doctorProfile?.experience || '',
        bio: data.doctorProfile?.bio || '',
        hospital: data.doctorProfile?.hospital || '',
        address: data.doctorProfile?.address || '',
        consultationFee: data.doctorProfile?.consultationFee || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateMe(form);
      setUser((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>Doctor Profile</h2>
        <p>Update your professional information visible to patients</p>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="card profile-avatar-card">
            <div className="profile-big-avatar" style={{ background: 'var(--primary)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3>{user?.name}</h3>
            <p className="profile-email">{form.specialization}</p>
            <span className="badge badge-completed">Doctor</span>
          </div>
        </div>

        <div className="profile-form-col">
          <div className="card">
            <h3 className="profile-section-title">Personal Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required className="form-input input-padded" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="input-icon-wrap">
                    <Phone size={16} className="input-icon" />
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="form-input input-padded" />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <div className="input-icon-wrap">
                    <Stethoscope size={16} className="input-icon" />
                    <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      className="form-input input-padded" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="form-input" min={0} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic</label>
                  <div className="input-icon-wrap">
                    <Building size={16} className="input-icon" />
                    <input type="text" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                      className="form-input input-padded" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <div className="input-icon-wrap">
                    <IndianRupee size={16} className="input-icon" />
                    <input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      className="form-input input-padded" min={0} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="form-input" placeholder="Clinic address" />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="form-input" placeholder="Tell patients about your expertise and experience..." rows={4} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
