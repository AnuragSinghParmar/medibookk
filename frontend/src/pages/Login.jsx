import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb-a" />
      <div className="auth-bg-orb orb-b" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon-lg"><Heart size={24} fill="currentColor" /></div>
          <h1>MediBook</h1>
        </div>
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="doctor@hospital.com"
                className="form-input input-padded"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="••••••••"
                className="form-input input-padded"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={18} /></>}
          </button>
        </form>
        <div className="auth-divider"><span>Don't have an account?</span></div>
        <Link to="/register" className="btn btn-ghost btn-full">Create Account</Link>

        <div className="demo-credentials">
          <p className="demo-title">🔑 Demo Credentials</p>
          <p className="demo-hint">Register a new account to get started!</p>
        </div>
      </div>
    </div>
  );
}
