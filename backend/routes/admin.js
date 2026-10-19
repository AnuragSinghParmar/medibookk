const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const { protect, isAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(protect, isAdmin);

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    
    const unapprovedDoctors = await User.countDocuments({ role: 'doctor', isApproved: false });
    
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      unapprovedDoctors,
      totalAppointments,
      completedAppointments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
});

// GET /api/admin/doctors (including unapproved)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').sort('-createdAt');
    const profiles = await DoctorProfile.find();
    
    const formattedDocs = doctors.map(doc => {
      const profile = profiles.find(p => p.userId.toString() === doc._id.toString());
      return {
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        isApproved: doc.isApproved,
        specialization: profile ? profile.specialization : 'N/A',
        createdAt: doc.createdAt
      };
    });

    res.json(formattedDocs);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
});

// PUT /api/admin/doctors/:id/approve
router.put('/doctors/:id/approve', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.isApproved = true;
    await doctor.save();
    
    res.json({ message: 'Doctor approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error approving doctor' });
  }
});

// GET /api/admin/patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort('-createdAt');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    if (user.role === 'doctor') {
      await DoctorProfile.findOneAndDelete({ userId: user._id });
      await Appointment.deleteMany({ doctorId: user._id });
    } else if (user.role === 'patient') {
      await Appointment.deleteMany({ patientId: user._id });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
