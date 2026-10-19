import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Shield, Clock, Star, ArrowRight, Stethoscope, Calendar, CheckCircle, Users
} from 'lucide-react';
import './Home.css';

const features = [
  { icon: <Stethoscope size={28} />, title: 'Expert Doctors', desc: 'Connect with verified specialists across 20+ medical disciplines.' },
  { icon: <Calendar size={28} />, title: 'Easy Scheduling', desc: 'Browse available slots and book your appointment in under 2 minutes.' },
  { icon: <Shield size={28} />, title: 'Secure & Private', desc: 'Your medical data is encrypted and completely confidential.' },
  { icon: <Clock size={28} />, title: '24/7 Access', desc: 'Manage your appointments anytime, from any device.' },
];

const specializations = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'Psychiatry', 'Oncology', 'Gynecology',
];

const steps = [
  { step: '01', title: 'Find a Doctor', desc: 'Search by name, specialization, or hospital.' },
  { step: '02', title: 'Choose a Slot', desc: 'Pick a date and available time that works for you.' },
  { step: '03', title: 'Book & Wait', desc: 'Submit your appointment and the doctor will confirm.' },
  { step: '04', title: 'Get Treated', desc: 'Attend your appointment and leave a review.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-content">
          <div className="hero-badge">
            <Heart size={14} fill="currentColor" /> Trusted Healthcare Platform
          </div>
          <h1 className="hero-title">
            Book Your Doctor<br />
            <span className="gradient-text">Appointment Instantly</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top-rated specialists, choose your convenient slot, 
            and manage your entire healthcare journey in one place.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link
                to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/doctors" className="btn btn-ghost btn-lg">
                  Browse Doctors
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-lbl">Doctors</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">10k+</span><span className="stat-lbl">Patients</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">4.9★</span><span className="stat-lbl">Rating</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <CheckCircle size={18} color="var(--success)" />
            <div><p className="fc-title">Appointment Confirmed</p><p className="fc-sub">Dr. Sarah Johnson • Cardiology</p></div>
          </div>
          <div className="hero-orb-center">
            <Heart size={60} fill="var(--primary)" color="var(--primary)" />
          </div>
          <div className="floating-card card-2">
            <Star size={18} color="var(--warning)" fill="var(--warning)" />
            <div><p className="fc-title">4.9 / 5 Rating</p><p className="fc-sub">Based on 2,400+ reviews</p></div>
          </div>
          <div className="floating-card card-3">
            <Users size={18} color="var(--accent)" />
            <div><p className="fc-title">Online Now</p><p className="fc-sub">48 doctors available</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Choose MediBook?</h2>
            <p>Everything you need for seamless healthcare management</p>
          </div>
          <div className="grid-4">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="spec-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Browse by Specialization</h2>
            <p>Find specialists across all medical fields</p>
          </div>
          <div className="spec-grid">
            {specializations.map((s) => (
              <Link to={`/doctors?specialization=${s}`} key={s} className="spec-chip">
                <Stethoscope size={14} /> {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>How It Works</h2>
            <p>Book an appointment in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow"><ArrowRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <div className="cta-orb" />
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of patients who trust MediBook for their healthcare needs.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register?role=patient" className="btn btn-primary btn-lg">
                  Join as Patient
                </Link>
                <Link to="/register?role=doctor" className="btn btn-accent btn-lg">
                  Join as Doctor
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="navbar-brand">
              <div className="brand-icon"><Heart size={16} fill="currentColor" /></div>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>MediBook</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              © 2024 MediBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
