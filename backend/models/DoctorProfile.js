const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },       // "2024-07-15"
  time: { type: String, required: true },        // "10:00 AM"
  isBooked: { type: Boolean, default: false },
});

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true, default: 0 },  // years
    bio: { type: String, default: '' },
    consultationFee: { type: Number, default: 500 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    hospital: { type: String, default: '' },
    address: { type: String, default: '' },
    availableSlots: [slotSchema],
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
