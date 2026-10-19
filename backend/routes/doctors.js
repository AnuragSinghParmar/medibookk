const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { protect } = require('../middleware/auth');

// GET /api/doctors - Get all doctors with profiles
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = {};

    const profiles = await DoctorProfile.find(query).populate({
      path: 'userId',
      select: 'name email phone isApproved',
      match: { role: 'doctor' }
    });

    // Filter out profiles where the user wasn't populated or is not approved
    const validProfiles = profiles.filter(p => p.userId && p.userId.isApproved);

    let results = validProfiles.map((p) => ({
      _id: p.userId._id,
      doctorProfileId: p._id,
      name: p.userId.name,
      email: p.userId.email,
      phone: p.userId.phone,
      specialization: p.specialization,
      experience: p.experience,
      bio: p.bio,
      consultationFee: p.consultationFee,
      rating: p.rating,
      totalRatings: p.totalRatings,
      hospital: p.hospital,
      address: p.address,
      availableSlots: p.availableSlots,
    }));

    if (specialization) {
      results = results.filter((d) =>
        d.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.specialization.toLowerCase().includes(s) ||
          d.hospital.toLowerCase().includes(s)
      );
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctors/:id - Get single doctor by userId
router.get('/:id', async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.params.id }).populate(
      'userId',
      'name email phone'
    );
    if (!profile) return res.status(404).json({ message: 'Doctor not found' });

    res.json({
      _id: profile.userId._id,
      doctorProfileId: profile._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      specialization: profile.specialization,
      experience: profile.experience,
      bio: profile.bio,
      consultationFee: profile.consultationFee,
      rating: profile.rating,
      totalRatings: profile.totalRatings,
      hospital: profile.hospital,
      address: profile.address,
      availableSlots: profile.availableSlots,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/doctors/profile - Doctor updates own profile
router.put('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });

    const { specialization, experience, bio, consultationFee, hospital, address } = req.body;
    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { specialization, experience, bio, consultationFee, hospital, address },
      { new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/doctors/slots - Add available slots
router.post('/slots', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const { slots } = req.body; // [{ date, time }]
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Remove duplicate slots and past dates based on Asia/Kolkata timezone
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const todayStr = `${year}-${month}-${day}`;

    const existing = profile.availableSlots.map((s) => `${s.date}-${s.time}`);
    const newSlots = slots.filter((s) => !existing.includes(`${s.date}-${s.time}`) && s.date >= todayStr);
    
    if (newSlots.length === 0) {
      return res.status(400).json({ message: 'No valid future slots provided or slots already exist' });
    }
    
    profile.availableSlots.push(...newSlots);
    await profile.save();
    res.json(profile.availableSlots);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/doctors/slots/:slotId - Remove a slot
router.delete('/slots/:slotId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const slot = profile.availableSlots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot. Cancel the appointment first.' });
    }

    profile.availableSlots = profile.availableSlots.filter(
      (s) => s._id.toString() !== req.params.slotId
    );
    await profile.save();
    res.json({ message: 'Slot removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
