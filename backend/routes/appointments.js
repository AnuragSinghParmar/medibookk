const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const { protect, isPatient, isDoctor } = require('../middleware/auth');

// POST /api/appointments - Book appointment (patient)
router.post('/', protect, isPatient, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Mark slot as booked
    const profile = await DoctorProfile.findOne({ userId: doctorId });
    if (!profile) return res.status(404).json({ message: 'Doctor not found' });

    const slot = profile.availableSlots.find(
      (s) => s.date === date && s.time === time && !s.isBooked
    );
    if (!slot) return res.status(400).json({ message: 'Slot not available' });

    slot.isBooked = true;
    await profile.save();

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      doctorProfileId: profile._id,
      date,
      time,
      reason: reason || '',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/appointments/my - Get patient's appointments
router.get('/my', protect, isPatient, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    // Enrich with doctor profile info
    const enriched = await Promise.all(
      appointments.map(async (appt) => {
        const profile = await DoctorProfile.findOne({ userId: appt.doctorId._id });
        return {
          ...appt.toObject(),
          doctorSpecialization: profile ? profile.specialization : '',
          doctorHospital: profile ? profile.hospital : '',
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/appointments/doctor - Get doctor's appointments
router.get('/doctor', protect, isDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/appointments/:id/status - Doctor accepts/rejects/completes
router.put('/:id/status', protect, isDoctor, async (req, res) => {
  try {
    const { status, rejectionReason, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    if (notes) appointment.notes = notes;

    // If rejected, free the slot
    if (status === 'rejected' || status === 'cancelled') {
      const profile = await DoctorProfile.findOne({ userId: req.user._id });
      if (profile) {
        const slot = profile.availableSlots.find(
          (s) => s.date === appointment.date && s.time === appointment.time
        );
        if (slot) slot.isBooked = false;
        await profile.save();
      }
    }

    await appointment.save();
    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/appointments/:id/cancel - Patient cancels
router.put('/:id/cancel', protect, isPatient, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'accepted'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';

    // Free the slot
    const profile = await DoctorProfile.findOne({ userId: appointment.doctorId });
    if (profile) {
      const slot = profile.availableSlots.find(
        (s) => s.date === appointment.date && s.time === appointment.time
      );
      if (slot) slot.isBooked = false;
      await profile.save();
    }

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/appointments/:id/reschedule - Patient reschedules
router.put('/:id/reschedule', protect, isPatient, async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Free old slot
    const profile = await DoctorProfile.findOne({ userId: appointment.doctorId });
    if (profile) {
      const oldSlot = profile.availableSlots.find(
        (s) => s.date === appointment.date && s.time === appointment.time
      );
      if (oldSlot) oldSlot.isBooked = false;

      const newSlot = profile.availableSlots.find(
        (s) => s.date === newDate && s.time === newTime && !s.isBooked
      );
      if (!newSlot) return res.status(400).json({ message: 'New slot not available' });
      newSlot.isBooked = true;
      await profile.save();
    }

    appointment.rescheduledFrom = { date: appointment.date, time: appointment.time };
    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = 'pending';
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/appointments/:id/rate - Patient rates doctor
router.post('/:id/rate', protect, isPatient, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed appointments' });
    }
    if (appointment.isRated) {
      return res.status(400).json({ message: 'Already rated' });
    }

    appointment.rating = rating;
    appointment.review = review || '';
    appointment.isRated = true;
    await appointment.save();

    // Update doctor average rating
    const profile = await DoctorProfile.findOne({ userId: appointment.doctorId });
    if (profile) {
      const newTotal = profile.totalRatings + 1;
      profile.rating = (profile.rating * profile.totalRatings + rating) / newTotal;
      profile.totalRatings = newTotal;
      await profile.save();
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
