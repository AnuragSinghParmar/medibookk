import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, LogOut, User, Menu, X, Calendar, Stethoscope, Home, List, LayoutDashboard
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/doctors', label: 'Doctors', icon: <Stethoscope size={16} /> },
    { to: '/patient/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
    { to: '/patient/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/doctor/requests', label: 'Requests', icon: <List size={16} /> },
    { to: '/doctor/slots', label: 'Manage Slots', icon: <Calendar size={16} /> },
    { to: '/doctor/history', label: 'History', icon: <Calendar size={16} /> },
    { to: '/doctor/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={16} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'doctor' ? doctorLinks : user?.role === 'patient' ? patientLinks : [];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><Heart size={20} fill="currentColor" /></div>
          <span>MediBook</span>
        </Link>

        {user && (
          <ul className="navbar-links">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
                  {l.icon} {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!user && (
          <ul className="navbar-links">
            <li><Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}><Home size={16} /> Home</Link></li>
            <li><Link to="/doctors" className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}><Stethoscope size={16} /> Doctors</Link></li>
          </ul>
        )}

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          {user && links.map((l) => (
            <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setOpen(false)}>
              {l.icon} {l.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/" className="mobile-link" onClick={() => setOpen(false)}><Home size={16} /> Home</Link>
              <Link to="/doctors" className="mobile-link" onClick={() => setOpen(false)}><Stethoscope size={16} /> Doctors</Link>
              <Link to="/login" className="mobile-link" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
          {user && (
            <button onClick={handleLogout} className="mobile-link logout-btn">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
