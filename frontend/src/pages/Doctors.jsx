import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDoctors } from '../api';
import { Search, Star, Stethoscope, MapPin, Clock, IndianRupee, Filter } from 'lucide-react';
import './Doctors.css';

const specializations = [
  'All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'Psychiatry', 'General Practice', 'Gynecology', 'Oncology', 'ENT',
];

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : 'var(--text-muted)', fontSize: '14px' }}>★</span>
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
        {rating ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
}

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || 'All');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const matchSpec = selectedSpec === 'All' || d.specialization === selectedSpec;
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>Find Your Doctor</h2>
        <p>Browse our network of expert healthcare professionals</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="doctors-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, specialization, or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="spec-filter">
          <Filter size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <div className="spec-pills">
            {specializations.map((s) => (
              <button
                key={s}
                className={`spec-pill ${selectedSpec === s ? 'active' : ''}`}
                onClick={() => setSelectedSpec(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="results-count">
        {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Doctor Grid */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Stethoscope size={60} />
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {filtered.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }) {
  const availableCount = doctor.availableSlots?.filter((s) => !s.isBooked).length || 0;

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar-wrap">
          <div className="doctor-avatar">
            {doctor.name.charAt(0).toUpperCase()}
          </div>
          <div className={`online-dot ${availableCount > 0 ? 'available' : ''}`} />
        </div>
        <div className="doctor-basic">
          <h3>{doctor.name}</h3>
          <div className="doctor-spec">
            <Stethoscope size={13} /> {doctor.specialization}
          </div>
          <StarRating rating={doctor.rating} />
        </div>
      </div>

      <div className="doctor-info-grid">
        <div className="info-item">
          <Clock size={14} />
          <span>{doctor.experience || 0} yrs exp</span>
        </div>
        <div className="info-item">
          <IndianRupee size={14} />
          <span>₹{doctor.consultationFee || 500}</span>
        </div>
        {doctor.hospital && (
          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
            <MapPin size={14} />
            <span>{doctor.hospital}</span>
          </div>
        )}
      </div>

      {doctor.bio && (
        <p className="doctor-bio">{doctor.bio.slice(0, 100)}{doctor.bio.length > 100 ? '…' : ''}</p>
      )}

      <div className="doctor-footer">
        <div className={`slots-badge ${availableCount > 0 ? 'has-slots' : ''}`}>
          {availableCount > 0 ? `${availableCount} slots open` : 'No slots available'}
        </div>
        <Link to={`/doctors/${doctor._id}`} className="btn btn-primary btn-sm">
          View Profile
        </Link>
      </div>
    </div>
  );
}
