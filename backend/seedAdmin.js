require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@hospital.com',
        password: 'password123',
        role: 'admin',
        isApproved: true
      });
      console.log('Admin seeded successfully (admin@hospital.com / password123)');
    } else {
      console.log('Admin already exists');
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
});
