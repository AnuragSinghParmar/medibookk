import React, { useState, useEffect } from 'react';
import { getMe, addSlots, deleteSlot } from '../../api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Calendar, Clock, CheckCircle } from 'lucide-react';
import './ManageSlots.css';

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
];

export default function ManageSlots() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await getMe();
      setProfile(data);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const toggleTime = (t) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleAddSlots = async () => {
    if (!date || selectedTimes.length === 0) {
      toast.error('Select a date and at least one time slot');
      return;
    }
    setSaving(true);
    try {
      const slots = selectedTimes.map((time) => ({ date, time }));
      await addSlots(slots);
      toast.success(`${slots.length} slot(s) added!`);
      setSelectedTimes([]);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slots');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slotId) => {
    try {
      await deleteSlot(slotId);
      toast.success('Slot removed');
      fetchProfile();
    } catch { toast.error('Failed to remove slot'); }
  };

  const slots = profile?.doctorProfile?.availableSlots || [];
  const availableSlots = slots.filter((s) => !s.isBooked);
  const bookedSlots = slots.filter((s) => s.isBooked);

  // Min date = today (adjusted for local timezone)
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <h2>Manage Available Slots</h2>
        <p>Set your availability for patient appointments</p>
      </div>

      <div className="slots-layout">
        {/* Add Slots Panel */}
        <div className="card add-slots-panel">
          <h3 className="panel-title"><Plus size={18} /> Add Available Slots</h3>

          <div className="form-group">
            <label className="form-label">Select Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="date"
                className="form-input"
                style={{ paddingLeft: '2.5rem', cursor: 'pointer' }}
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Time Slots ({selectedTimes.length} selected)</label>
            <div className="time-grid">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`time-opt ${selectedTimes.includes(t) ? 'selected' : ''}`}
                  onClick={() => toggleTime(t)}
                >
                  {selectedTimes.includes(t) && <CheckCircle size={12} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleAddSlots}
            disabled={saving}
          >
            <Plus size={16} /> {saving ? 'Adding...' : `Add ${selectedTimes.length || ''} Slot(s)`}
          </button>
        </div>

        {/* Current Slots */}
        <div className="slots-overview">
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 className="panel-title"><CheckCircle size={18} /> Available Slots ({availableSlots.length})</h3>
            {availableSlots.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No available slots yet</p>
            ) : (
              <div className="slot-chips">
                {availableSlots.map((s) => (
                  <div key={s._id} className="slot-chip available">
                    <Calendar size={12} /> {s.date}
                    <Clock size={12} /> {s.time}
                    <button onClick={() => handleDelete(s._id)} className="delete-slot-btn" title="Remove">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bookedSlots.length > 0 && (
            <div className="card">
              <h3 className="panel-title" style={{ color: 'var(--warning)' }}>
                <Clock size={18} /> Booked Slots ({bookedSlots.length})
              </h3>
              <div className="slot-chips">
                {bookedSlots.map((s) => (
                  <div key={s._id} className="slot-chip booked">
                    <Calendar size={12} /> {s.date}
                    <Clock size={12} /> {s.time}
                    <span className="booked-label">Booked</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
