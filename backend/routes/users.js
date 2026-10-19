const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { protect } = require('../middleware/auth');

// GET /api/users/me - Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ userId: user._id });
    }

    res.json({ ...user.toObject(), doctorProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select('-password');

    // If doctor, also update their profile details
    if (user.role === 'doctor') {
      const { specialization, experience, bio, hospital, address, consultationFee } = req.body;
      await DoctorProfile.findOneAndUpdate(
        { userId: user._id },
        { specialization, experience, bio, hospital, address, consultationFee },
        { new: true }
      );
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
