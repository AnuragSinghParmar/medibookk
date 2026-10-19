const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile' },
    date: { type: String, required: true },      // "2024-07-15"
    time: { type: String, required: true },       // "10:00 AM"
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    notes: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },
    isRated: { type: Boolean, default: false },
    rescheduledFrom: {
      date: String,
      time: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
