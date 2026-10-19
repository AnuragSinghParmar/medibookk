import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, Mail, Lock, User, Phone, Stethoscope, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: searchParams.get('role') || 'patient',
    specialization: '', experience: '', bio: '', hospital: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data, data.token);
      toast.success(`Welcome to MediBook, ${data.name}! 🎉`);
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb-a" />
      <div className="auth-bg-orb orb-b" />
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <div className="brand-icon-lg"><Heart size={24} fill="currentColor" /></div>
          <h1>MediBook</h1>
        </div>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join thousands of patients and doctors</p>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${form.role === 'patient' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'patient' })}
          >
            <User size={16} /> Patient
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'doctor' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'doctor' })}
          >
            <Stethoscope size={16} /> Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  required placeholder="Dr. John Smith" className="form-input input-padded" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-icon-wrap">
                <Phone size={16} className="input-icon" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+91 98765 43210" className="form-input input-padded" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" name="email" value={form.email} onChange={handleChange}
                required placeholder="you@example.com" className="form-input input-padded" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" name="password" value={form.password} onChange={handleChange}
                required placeholder="Minimum 6 characters" className="form-input input-padded" />
            </div>
          </div>

          {form.role === 'doctor' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select name="specialization" value={form.specialization} onChange={handleChange}
                    required className="form-input">
                    <option value="">Select specialization</option>
                    {['Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics',
                      'Psychiatry','General Practice','Gynecology','Oncology','ENT',
                      'Ophthalmology','Urology'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" name="experience" value={form.experience} onChange={handleChange}
                    min={0} placeholder="Years of experience" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hospital / Clinic</label>
                <input type="text" name="hospital" value={form.hospital} onChange={handleChange}
                  placeholder="Apollo Hospital, Chennai" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio (optional)</label>
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  placeholder="Brief description about your expertise..." className="form-input" rows={3} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link to="/login" className="btn btn-ghost btn-full">Sign In</Link>
      </div>
    </div>
  );
}
